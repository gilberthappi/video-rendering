import type { $Enums } from "@prisma/client";
import { TsoaResponse } from "tsoa";
import { VideoStatus, Role } from "@prisma/client";

export type VideoStatusT = keyof typeof VideoStatus;
export type UserRoleT = keyof typeof Role;
export interface IResponse<T> {
  statusCode: number;
  message: string;
  error?: unknown;
  data?: T;
}

export type TUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  photo?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  roles?: { id: string; role: string; userId: string }[];
};

export type RoleT = "ADMIN" | "GUEST" | "CLIENT";

export interface IUser extends Omit<TUser, "id" | "createdAt" | "updatedAt"> {}
export interface ILoginResponse
  extends Omit<TUser, "password" | "createdAt" | "updatedAt" | "roles"> {
  token: string;
  roles: $Enums.Role[];
}
export interface ILoginUser extends Pick<IUser, "email" | "password"> {}
export interface ISignUpUser
  extends Pick<
    IUser,
    "email" | "password" | "firstName" | "lastName" | "roles"
  > {}

export type TErrorResponse = TsoaResponse<
  400 | 401 | 500,
  IResponse<{ message: string }>
>;

export interface IResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
}

export type TFaq = {
  id: string;
  question: string;
  solution: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateFaqDto {
  question: string;
  solution: string;
}

export type TVideo = {
  id: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  url: string;
  status: "UPLOADED" | "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export interface IVideo {
  id: string;
  title: string;
  description?: string | null;
  thumbnail?: Express.Multer.File | string | null;
  url: Express.Multer.File | string;
  status: VideoStatusT;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface CreateVideoDto {
  title: string;
  description?: string;
  thumbnail?: Express.Multer.File | string;
  url: Express.Multer.File | string;
}

export interface UpdateVideoDto extends Partial<CreateVideoDto> {
  status?: VideoStatusT;
  processingError?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
