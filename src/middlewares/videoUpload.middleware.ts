import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/error";

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.VIDEO_UPLOAD_DIR || "./uploads/videos";

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

export const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 1024 * 1024 * 500, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const validMimeTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
    ];

    if (validMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid video file type"));
    }
  },
});

export const processVideoUpload = videoUpload.fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

export const handleVideoUpload = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.files) {
      throw new AppError("No files uploaded", 400);
    }

    const files = req.files as Record<string, Express.Multer.File[]>;

    if (!files.video?.[0]) {
      throw new AppError("Video file is required", 400);
    }

    req.body.video = {
      url: files.video[0].path,
      ...(files.thumbnail?.[0] && { thumbnail: files.thumbnail[0].path }),
    };

    next();
  } catch (error) {
    next(error);
  }
};
