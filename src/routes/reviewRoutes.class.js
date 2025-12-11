import express from "express";
import ReviewController from "../controllers/ReviewController.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";

const router = express.Router();

router.get("/", AuthMiddleware.verifyJWT, ReviewController.getAll);
router.get("/:id", AuthMiddleware.verifyJWT, ReviewController.getById);
router.post("/", AuthMiddleware.verifyJWT, ReviewController.create);
router.put("/:id", AuthMiddleware.verifyJWT, ReviewController.update);
router.delete("/:id", AuthMiddleware.verifyJWT, ReviewController.delete);

export default router;
