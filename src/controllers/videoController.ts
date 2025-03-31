import {
  Body,
  Get,
  Middlewares,
  Patch,
  Post,
  Query,
  Route,
  Security,
  Tags,
  Path,
  Request,
  Response,
} from "tsoa";
import { VideoService } from "../services/video.service";
import { VideoStatus } from "@prisma/client";
import { loggerMiddleware } from "../utils/loggers/loggingMiddleware";
import { Request as ExpressRequest } from "express";
import { CreateVideoDto } from "../utils/interfaces/common";
import type {
  IVideo,
  PaginatedResponse,
  TUser,
} from "../utils/interfaces/common";
import upload from "../utils/cloudinary";

import {
  processVideoUpload,
  handleVideoUpload,
} from "../middlewares/videoUpload.middleware";
import { Prisma } from "@prisma/client";
@Tags("Video Processing")
@Route("videos")
export class VideoController {
  /**
   * Upload a new video for processing
   * @param videoData Basic video information
   * @param req Express request with uploaded files
   */
  @Post("/")
  @Security("jwt")
  @Middlewares(
    upload.any(),
    loggerMiddleware,
    processVideoUpload,
    handleVideoUpload,
  )
  @Response<IVideo>(201, "Video uploaded successfully")
  @Response<{ error: string }>(
    400,
    "Bad Request - Invalid file type or missing file",
  )
  @Response<{ error: string }>(401, "Unauthorized")
  @Response<{ error: string }>(500, "Internal Server Error")
  public async uploadVideo(
    @Body() videoData: CreateVideoDto,
    @Request() req: ExpressRequest,
  ): Promise<IVideo> {
    const user = req.user as TUser;
    return VideoService.createVideo(user.id, {
      ...videoData,
      url: req.body.video.url,
      thumbnail: req.body.video.thumbnail,
    });
  }

  /**
   * Get paginated list of videos with optional status filter
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 10)
   * @param status Filter by processing status
   */
  @Get("/")
  @Response<PaginatedResponse<IVideo>>(200, "Videos retrieved successfully")
  @Response<{ error: string }>(500, "Internal Server Error")
  public async getVideos(
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() status?: VideoStatus,
  ): Promise<PaginatedResponse<IVideo>> {
    return VideoService.getVideosPaginated(
      page,
      limit,
      status ? { status } : undefined,
    );
  }

  /**
   * Update video processing status
   * @param id Video ID
   * @param body New status and optional metadata
   */
  @Patch("/{id}/status")
  @Security("jwt")
  @Response<IVideo>(200, "Status updated successfully")
  @Response<{ error: string }>(400, "Invalid status transition")
  @Response<{ error: string }>(404, "Video not found")
  @Response<{ error: string }>(500, "Internal Server Error")
  public async updateStatus(
    @Path() id: string,
    @Body() body: { status: VideoStatus; metadata?: Prisma.InputJsonValue },
  ): Promise<IVideo> {
    return VideoService.updateVideoStatus(id, body.status, body.metadata);
  }
}
