import express from "express";
import { getImage } from "../controllers/imageController.js";

const router = express.Router();

// Route to serve uploaded images
router.get("/:filename", getImage);

export default router;
