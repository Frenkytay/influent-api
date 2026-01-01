import express from "express";
import AdminController from "../controllers/AdminController.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";

const router = express.Router();

// Protect all admin routes
router.use(AuthMiddleware.verifyJWT);
router.use(AuthMiddleware.isAdmin); 

router.post("/verify-student", AdminController.verifyStudent);

export default router;
