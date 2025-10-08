import express from "express";
import {
  uploadSingle,
  uploadMultiple,
} from "../controllers/imageController.js";
import Campaign from "../models/Campaign.js";
import User from "../models/User.js";

const router = express.Router();

// Upload campaign banner image
router.post(
  "/campaign/:id/banner",
  uploadSingle("banner_image"),
  async (req, res) => {
    try {
      const campaign = await Campaign.findByPk(req.params.id);
      if (!campaign)
        return res.status(404).json({ error: "Campaign not found" });

      if (req.body.banner_image_path) {
        await campaign.update({ banner_image: req.body.banner_image_path });
      }

      res.json({
        message: "Banner image uploaded successfully",
        banner_image: req.body.banner_image_path,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload banner image" });
    }
  }
);

// Upload campaign reference images
router.post(
  "/campaign/:id/references",
  uploadMultiple("reference_images", 5),
  async (req, res) => {
    try {
      const campaign = await Campaign.findByPk(req.params.id);
      if (!campaign)
        return res.status(404).json({ error: "Campaign not found" });

      if (req.body.reference_images_paths) {
        await campaign.update({
          reference_images: req.body.reference_images_paths,
        });
      }

      res.json({
        message: "Reference images uploaded successfully",
        reference_images: JSON.parse(req.body.reference_images_paths || "[]"),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload reference images" });
    }
  }
);

// Upload user profile image
router.post(
  "/user/:id/profile",
  uploadSingle("profile_image"),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      if (req.body.profile_image_path) {
        await user.update({ profile_image: req.body.profile_image_path });
      }

      res.json({
        message: "Profile image uploaded successfully",
        profile_image: req.body.profile_image_path,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload profile image" });
    }
  }
);

export default router;
