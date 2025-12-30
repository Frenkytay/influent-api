import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * UploadMiddleware - File upload configuration and handlers
 */
class UploadMiddleware {
  constructor() {
    this.uploadDir = this.resolveUploadDir();
    this.ensureUploadDir();
    
    // Configure storage
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        cb(null, `${basename}-${uniqueSuffix}${ext}`);
      },
    });

    // File filter
    this.fileFilter = (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|zip|mp4|mov|avi/;
      const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(new Error("Invalid file type. Only images, documents, and videos are allowed."));
    };

    // Create base uploader
    this.uploader = multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB default
      },
    });
  }

  /**
   * Resolve appropriate upload directory
   */
  resolveUploadDir() {
    // If explicitly on Vercel or similar read-only env, prefer tmp
    if (process.env.VERCEL || process.env.AWS_REGION) {
         // return os.tmpdir();
         // Actually, let's just stick to the try/catch writability check as it's more robust
    }

    const localUploads = path.join(__dirname, "../../uploads");
    try {
      // Try to create/access the local uploads directory
      // We check access first to avoid mkdir throwing
      if (!fs.existsSync(localUploads)) {
        fs.mkdirSync(localUploads, { recursive: true });
      }
      // Test writability
      fs.accessSync(localUploads, fs.constants.W_OK);
      return localUploads;
    } catch (err) {
      console.warn("Local uploads directory is read-only or inaccessible. Falling back to system temp directory.");
      return os.tmpdir();
    }
  }

  /**
   * Ensure upload directory exists
   */
  ensureUploadDir() {
    if (this.uploadDir === os.tmpdir()) {
         return;
    }

    if (!fs.existsSync(this.uploadDir)) {
       try {
        fs.mkdirSync(this.uploadDir, { recursive: true });
       } catch (e) {
           console.error("Failed to ensure upload dir", e);
       }
    }
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
   * Image-only upload
   */
  image(fieldName) {
    const imageUploader = multer({
      storage: this.storage,
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(
          path.extname(file.originalname).toLowerCase()
        );
        const mimetype = file.mimetype.startsWith("image/");

        if (mimetype && extname) {
          return cb(null, true);
        }
        cb(new Error("Only image files are allowed"));
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB for images
      },
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
        const allowedTypes = /pdf|doc|docx|xls|xlsx|txt/;
        const extname = allowedTypes.test(
          path.extname(file.originalname).toLowerCase()
        );

        if (extname) {
          return cb(null, true);
        }
        cb(new Error("Only document files are allowed"));
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB for documents
      },
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
        const allowedTypes = /mp4|mov|avi|wmv|flv|mkv/;
        const extname = allowedTypes.test(
          path.extname(file.originalname).toLowerCase()
        );
        const mimetype = file.mimetype.startsWith("video/");

        if (mimetype && extname) {
          return cb(null, true);
        }
        cb(new Error("Only video files are allowed"));
      },
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB for videos
      },
    });

    return videoUploader.single(fieldName);
  }

  /**
   * Handle multer errors
   */
  handleError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          error: "File too large",
          message: "The uploaded file exceeds the maximum allowed size",
        });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          success: false,
          error: "Too many files",
          message: "You have exceeded the maximum number of files allowed",
        });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          success: false,
          error: "Unexpected field",
          message: "An unexpected file field was encountered",
        });
      }
    }

    if (err.message) {
      return res.status(400).json({
        success: false,
        error: "Upload failed",
        message: err.message,
      });
    }

    next(err);
  };
}

export default new UploadMiddleware();
