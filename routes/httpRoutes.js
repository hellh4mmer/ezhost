import { Router } from 'express';
import uploadSystem from '../middlewares/multer.js';
import {
  helloWorld,
  listFiles,
  uploadFile,
} from '../controllers/httpController.js';

const router = Router();

router.get('/hello', helloWorld);
router.get('/files', listFiles);
router.post('/upload', uploadSystem, uploadFile);

export default router;
