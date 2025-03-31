import { BaseService } from "./Service";
import { prisma } from "../utils/client";
import { CreateFaqDto, IResponse, TFaq } from "../utils/interfaces/common";
import AppError from "../utils/error";

export class FaqService extends BaseService {
  public async createFaq(faqData: CreateFaqDto): Promise<IResponse<TFaq>> {
    try {
      const newFaq = await prisma.faq.create({
        data: {
          question: faqData.question,
          solution: faqData.solution,
        },
      });
      return {
        statusCode: 201,
        message: "Faq created successfully",
        data: newFaq,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async getFaq(faqId: string): Promise<IResponse<TFaq>> {
    try {
      const faq = await prisma.faq.findUnique({
        where: {
          id: faqId,
        },
      });

      if (!faq) {
        throw new AppError("Faq post not found", 404);
      }
      return {
        statusCode: 200,
        message: "Faq post fetched successfully",
        data: faq,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async getAllFaq(): Promise<IResponse<TFaq[]>> {
    try {
      const faq = await prisma.faq.findMany();

      return {
        statusCode: 200,
        message: "faq fetched successfully",
        data: faq,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async updateFaq(
    faqId: string,
    faqData: Partial<CreateFaqDto>,
  ): Promise<IResponse<TFaq>> {
    try {
      const updatedFaq = await prisma.faq.update({
        where: { id: faqId },
        data: {
          ...faqData,
        },
      });
      return {
        statusCode: 200,
        message: "faq post updated successfully",
        data: updatedFaq,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async deleteFaq(faqId: string): Promise<IResponse<null>> {
    try {
      await prisma.faq.delete({ where: { id: faqId } });
      return {
        statusCode: 200,
        message: "faq post deleted successfully",
        data: null,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }
}
