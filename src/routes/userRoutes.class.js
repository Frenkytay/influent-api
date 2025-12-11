import express from "express";
import UserController from "../controllers/UserController.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";

const router = express.Router();

// Public routes
// (none for users - all require authentication)

// Protected routes (require authentication)
router.get("/me", AuthMiddleware.verifyJWT, UserController.getMe);
router.put("/me", AuthMiddleware.verifyJWT, UserController.updateMe);

// Admin routes
router.get("/", AuthMiddleware.verifyJWT, UserController.getAllUsers);
router.get("/:id", AuthMiddleware.verifyJWT, UserController.getById);
router.post("/", AuthMiddleware.verifyJWT, UserController.create);
router.put("/:id", AuthMiddleware.verifyJWT, UserController.update);
router.delete("/:id", AuthMiddleware.verifyJWT, UserController.delete);

export default router;
