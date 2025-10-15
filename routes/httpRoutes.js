import { Router } from "express";
import {
	healthCheck,
	listFiles,
	uploadFile,
} from "../controllers/httpController.js";
import uploadSystem from "../middlewares/multer.js";
import localOnly from "../middlewares/localOnly.js";
import limiter from "../middlewares/limiter.js";

const router = Router();

router.get("/healthcheck", localOnly, healthCheck);
router.get("/files", limiter, listFiles);
router.post("/upload", limiter, uploadSystem, uploadFile);

export default router;
