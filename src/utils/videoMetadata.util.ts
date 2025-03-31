import ffmpeg from "fluent-ffmpeg";
import ffprobe from "ffprobe-static";
import AppError from "./error";

ffmpeg.setFfprobePath(ffprobe.path);

export interface VideoMetadata {
  duration: number;
  width?: number;
  height?: number;
  format?: string;
  size: number;
  codec?: string;
  bitrate?: number;
  audioCodec?: string;
  rotation?: number;
}

export async function extractVideoMetadata(
  filePath: string,
): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(new AppError("Failed to extract video metadata", 500));
        return;
      }

      const videoStream = metadata.streams.find(
        (s) => s.codec_type === "video",
      );
      const audioStream = metadata.streams.find(
        (s) => s.codec_type === "audio",
      );

      const duration =
        typeof metadata.format.duration === "number"
          ? Math.round(metadata.format.duration)
          : 0;

      const size =
        typeof metadata.format.size === "number" ? metadata.format.size : 0;

      const bitrate =
        typeof metadata.format.bit_rate === "number"
          ? metadata.format.bit_rate
          : undefined;

      const rotation =
        typeof videoStream?.rotation === "number"
          ? videoStream.rotation
          : undefined;

      const result: VideoMetadata = {
        duration,
        width: videoStream?.width,
        height: videoStream?.height,
        format: metadata.format.format_name,
        size,
        codec: videoStream?.codec_name,
        bitrate,
        audioCodec: audioStream?.codec_name,
        rotation,
      };

      resolve(result);
    });
  });
}
