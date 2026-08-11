import multer from "multer";
import path from "path";
import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import { HttpError } from "./error.middleware.js";

const allowed = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/vehicles"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${crypto.randomUUID()}${ext}`;
    cb(null, filename);
  },
});

export const vehiclePhotoUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Image Limit 5 MB
  fileFilter: (_req, file, cb) => {
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new HttpError("Only JPG, PNG and WebP images are allowed", StatusCodes.BAD_REQUEST));
  },
});
