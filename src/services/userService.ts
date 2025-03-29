/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../utils/client";
import {
  IUser,
  IResponse,
  ILoginUser,
  ISignUpUser,
} from "../utils/interfaces/common";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/error";
import { randomBytes } from "crypto";
import { sendEmail } from "../utils/email";
import { hash } from "bcrypt";
import { roles } from "../utils/roles";
import type { Request } from "express";

export class UserService {
  public static async getUsers(): Promise<IResponse<IUser[]>> {
    try {
      const users = await prisma.user.findMany({
        include: {
          roles: true,
          agents: true,
        },
      });
      return {
        message: "welcome",
        statusCode: 200,
        data: users,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async loginUser(user: ILoginUser) {
    try {
      const userData = await prisma.user.findFirst({
        where: { email: user.email },
        include: {
          roles: true,
        },
      });
      if (!userData) {
        throw new AppError("user account not found ", 401);
      }

      const isPasswordSimilar = await compare(user.password, userData.password);
      if (isPasswordSimilar) {
        const token = jwt.sign(user.email, process.env.JWT_SECRET!);
        const userRoles = userData.roles.map((roleRecord) => roleRecord.role);
        return {
          message: "",
          statusCode: 200,
          data: {
            token,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            id: userData.id,
            roles: userRoles,
          },
        };
      }
      throw new AppError("user account with email or password not found", 401);
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  // user signup
  public static async signUpUser(user: ISignUpUser) {
    try {
      // Check if user already exists
      const userExists = await prisma.user.findFirst({
        where: { email: user.email },
      });
      if (userExists) {
        throw new AppError("User already exists", 409);
      }

      // Hash password
      const hashedPassword = await hash(user.password, 10);
      const token = jwt.sign(user.email, process.env.JWT_SECRET!);
      await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: hashedPassword,
          },
        });

        if (!createdUser) {
          throw new Error("Failed to create user");
        }

        // Assign the "USER" role
        const assignRole = await tx.userRoles.create({
          data: {
            userId: createdUser.id,
            role: roles.CLIENT,
          },
        });

        if (!assignRole) {
          throw new Error("Failed to assign role to user");
        }
      });

      return {
        message: "User created successfully",
        data: {
          token,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: [roles.CLIENT],
        },
        statusCode: 201,
      };
    } catch (error) {
      throw new AppError("Internal Server Error", 500);
    }
  }
  // Method to request otp
  public static async requestPasswordReset(email: string) {
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Generate a 6-digit OTP
    const otp = randomBytes(3).toString("hex").toUpperCase();
    const otpExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Update the user with OTP and expiration time
    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiresAt },
    });

    // Send OTP via email (implement sendEmail utility)
    await sendEmail({
      to: user.email,
      subject: "Password Reset - One-Time Password (OTP)",
      body: `
    Dear ${user.firstName || "User"},

    You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed with the password reset process:

    OTP: ${otp}

    This OTP is valid for a limited time. If you did not request a password reset, please disregard this email.

    Best regards,
    Group8 Support Team
  `,
    });

    return { message: "OTP sent to your email " };
  }

  // Method to reset password
  public static async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (
      !user.otp ||
      user.otp !== otp ||
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update the user with the new password and clear OTP fields
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, otp: null, otpExpiresAt: null },
    });

    return { message: "Password reset successfully" };
  }
  public static async deleteUser(id: number) {
    try {
      // Check if the user exists and include related records
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          roles: true,
          likes: true,
          testimonials: true,
          agents: {
            include: {
              agentReviews: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      await prisma.$transaction(async (tx) => {
        // Delete the user's likes
        await tx.likes.deleteMany({
          where: { userId: id },
        });

        // Delete the user's testimonials
        await tx.testimony.deleteMany({
          where: { userId: id },
        });

        // Delete the user's agent reviews if they exist
        for (const agent of user.agents) {
          if (agent.agentReviews) {
            await tx.agentReview.delete({
              where: { id: agent.agentReviews.id },
            });
          }
        }

        // Delete the user's agent records
        if (user.agents.length > 0) {
          await tx.agents.deleteMany({
            where: { userId: id },
          });
        }

        // Delete the user's roles
        await tx.userRoles.deleteMany({
          where: { userId: id },
        });

        // Delete the user
        await tx.user.delete({
          where: { id },
        });
      });

      return { message: "User and related activities deleted successfully" };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  // Get users count by month, filtered by year
  public static async getUsersCountByMonth(
    year: number,
  ): Promise<IResponse<any>> {
    try {
      const users = await prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
        select: {
          createdAt: true,
        },
      });
      // Initialize an array with 12 months (0 for each month)
      const usersCountByMonth = Array(12).fill(0);
      // Group by month using JavaScript
      users.forEach((user) => {
        const month = new Date(user.createdAt).getMonth();
        usersCountByMonth[month]++;
      });

      return {
        message: "Users count by month fetched successfully",
        statusCode: 200,
        data: usersCountByMonth,
      };
    } catch (error) {
      throw new AppError("Error fetching users count by month", 500);
    }
  }

  public static async getMe(req: Request) {
    try {
      const userId = req.user!.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: true,
        },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      const userRoles = user.roles.map((roleRecord) => roleRecord.role);
      return {
        message: "User fetched successfully",
        statusCode: 200,
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roles: userRoles,
        },
      };
    } catch (error) {
      throw new AppError("Error fetching user", 500);
    }
  }
}
