import { Prisma } from "@prisma/client";
import { prisma } from "../utils/client";
import {
  IVideo,
  CreateVideoDto,
  PaginatedResponse,
  VideoStatusT,
} from "../utils/interfaces/common";

export class VideoService {
  private static videoIncludes: Prisma.VideoInclude = {
    user: {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        photo: true,
      },
    },
  };

  static async createVideo(
    userId: string,
    videoData: CreateVideoDto,
  ): Promise<IVideo> {
    return prisma.video.create({
      data: {
        ...videoData,
        url: typeof videoData.url === "string" ? videoData.url : "",
        thumbnail:
          typeof videoData.thumbnail === "string" ? videoData.thumbnail : "",
        userId,
        status: "UPLOADED",
      },
      include: this.videoIncludes,
    });
  }

  static async getVideosPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: Prisma.VideoWhereInput,
  ): Promise<PaginatedResponse<IVideo>> {
    const [total, videos] = await Promise.all([
      prisma.video.count({ where: filters }),
      prisma.video.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: filters,
        orderBy: { createdAt: "desc" },
        include: this.videoIncludes,
      }),
    ]);

    return {
      data: videos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async updateVideoStatus(
    videoId: string,
    status: VideoStatusT,
    metadata?: Record<string, unknown>,
  ): Promise<IVideo> {
    return prisma.video.update({
      where: { id: videoId },
      data: {
        status,
        ...(metadata && { metadata }),
      },
      include: this.videoIncludes,
    });
  }
}
