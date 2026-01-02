import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

/**
 * UploadMiddleware - File upload configuration and handlers using Cloudinary
 */
class UploadMiddleware {
  constructor() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Configure Cloudinary Storage
    this.storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: "influent_uploads", // The folder in Cloudinary
        allowed_formats: ["jpg", "png", "jpeg", "gif", "pdf", "doc", "docx", "mp4", "avi"], // Adjust as needed
        resource_type: "auto", // Automatically detect image/video/raw
      },
    });

    // Create base uploader
    this.uploader = multer({
      storage: this.storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB default limit
      },
    });
  }

  /**
   * Single file upload
   */
  single(fieldName) {
    return this.uploader.single(fieldName);
  }

  /**
   * Multiple files upload
   */
  multiple(fieldName, maxCount = 10) {
    return this.uploader.array(fieldName, maxCount);
  }

  /**
   * Mixed fields upload
   */
  fields(fields) {
    return this.uploader.fields(fields);
  }

  /**
   * Image-only upload - using same storage but we can add fileFilter here if we want strict validation before upload,
   * though Cloudinary also handles formats. Let's keep a basic filter.
   */
  image(fieldName) {
    // We can reuse the main uploader or create a specific one if we want different params.
    // For simplicity, reusing the main but adding a wrapper or just using the main one is fine.
    // However, to enforce "image only" strictly at the app level:
    const imageUploader = multer({
        storage: this.storage,
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith("image/")) {
                cb(null, true);
            } else {
                cb(new Error("Only image files are allowed"), false);
            }
        },
        limits: { fileSize: 5 * 1024 * 1024 } // 5MB
    });
    return imageUploader.single(fieldName);
  }

  /**
   * Document-only upload
   */
  document(fieldName) {
      const docUploader = multer({
          storage: this.storage,
          fileFilter: (req, file, cb) => {
             // Basic mime check
             const allowed = /pdf|msword|officedocument|text/;
             if (allowed.test(file.mimetype)) {
                 cb(null, true);
             } else {
                 cb(new Error("Only document files are allowed"), false);
             }
          }
      });
    return docUploader.single(fieldName);
  }

  /**
   * Video-only upload
   */
  video(fieldName) {
      const videoUploader = multer({
          storage: this.storage,
          fileFilter: (req, file, cb) => {
              if (file.mimetype.startsWith("video/")) {
                  cb(null, true);
              } else {
                  cb(new Error("Only video files are allowed"), false);
              }
          },
          limits: { fileSize: 100 * 1024 * 1024 } // 100MB
      });
    return videoUploader.single(fieldName);
  }

  /**
   * Handle multer errors
   */
  handleError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        error: "Upload Error",
        message: err.message,
      });
    }

    if (err.message) {
      return res.status(400).json({
        success: false,
        error: "Upload Failed",
        message: err.message,
      });
    }

    next(err);
  };
}

export default new UploadMiddleware();
