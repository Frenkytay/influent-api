import express from "express";
import StudentController from "../controllers/StudentController.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";
import UploadMiddleware from "../middlewares/UploadMiddleware.class.js";

const router = express.Router();

router.get("/", AuthMiddleware.verifyJWT, StudentController.getAll);
router.get("/:id", AuthMiddleware.verifyJWT, StudentController.getById);
router.post("/", AuthMiddleware.verifyJWT, StudentController.create);
router.put("/:id", AuthMiddleware.verifyJWT, StudentController.update);
router.delete("/:id", AuthMiddleware.verifyJWT, StudentController.delete);
router.put("/profile", AuthMiddleware.verifyJWT, StudentController.updateProfile);
router.post("/upload-ktm", AuthMiddleware.verifyJWT, UploadMiddleware.image("ktm"), StudentController.uploadKTM);

router.post("/instagram/connect", AuthMiddleware.verifyJWT, StudentController.connectInstagram);

export default router;
