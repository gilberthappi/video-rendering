import type { NextFunction } from "express";
import type { Request, Response } from "express";

export const appendPhotoAttachments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.files) {
      const files = req.files as Express.Multer.File[];

      // Handle thumbnail
      if (
        !req.body.thumbnail &&
        files.some((file) => file.fieldname === "thumbnail")
      ) {
        req.body.thumbnail = files.find(
          (file) => file.fieldname === "thumbnail",
        )?.path;
      }

      // Handle video URL
      if (!req.body.url && files.some((file) => file.fieldname === "url")) {
        req.body.url = files.find((file) => file.fieldname === "url")?.path;
      }

      // Handle galleryImages
      const galleryFiles = files.filter(
        (file) => file.fieldname === "galleryImages",
      );
      if (galleryFiles.length > 0) {
        req.body.galleryImages = galleryFiles.map((file) => file.path);
      }
    }

    // Ensure thumbnail and url fields can accept URLs directly
    if (req.body.thumbnail && typeof req.body.thumbnail !== "string") {
      throw new Error("Invalid thumbnail format");
    }
    if (req.body.url && typeof req.body.url !== "string") {
      throw new Error("Invalid URL format");
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const appendPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      // Ensure the photo field is correctly extracted
      const photoFile = files.find((file) => file.fieldname === "photo");
      if (photoFile) {
        req.body.photo = photoFile.path;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const appendImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.file) {
      req.body.image = req.file.path;
    }
    next();
  } catch (error) {
    next(error);
  }
};
