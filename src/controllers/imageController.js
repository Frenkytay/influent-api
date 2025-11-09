import upload from "../middlewares/uploadMiddleware.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Single image upload
export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (req.file) {
        // Return the file path that can be stored in database
        req.body[fieldName + "_path"] = `/uploads/${req.file.filename}`;
      }

      next();
    });
  };
};

// Multiple images upload
export const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (req.files && req.files.length > 0) {
        // Return array of file paths
        const filePaths = req.files.map((file) => `/uploads/${file.filename}`);
        req.body[fieldName + "_paths"] = JSON.stringify(filePaths);
      }

      next();
    });
  };
};

// Get uploaded image
export const getImage = (req, res) => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, "../../uploads", filename);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Send the image file
    res.sendFile(imagePath);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve image" });
  }
};

// Delete image file
export const deleteImage = (imagePath) => {
  try {
    if (imagePath && imagePath.startsWith("/uploads/")) {
      const fullPath = path.join(__dirname, "../../", imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  } catch (error) {
    console.error("Failed to delete image:", error);
  }
};
