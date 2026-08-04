import httpStatus from "http-status";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import {env} from "../config/env";
import { AppError } from "../errors/apiError";
import fs from "fs/promises";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/jpg",
    "image/webp",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        httpStatus.BAD_REQUEST,
        "Only PDF and image files are allowed!"
      ),
      false
    );
  }
};

const upload = multer({ storage, fileFilter });

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});
const uploadIntoCloudinary = async (filePath: string) => {
  try {
    const result = await cloudinary.uploader.upload(filePath);

    return result;
  } catch (error) {
    console.error(error);
  } finally {
    await fs.unlink(filePath);
  }
};

export const fileUploader = { upload, uploadIntoCloudinary };
