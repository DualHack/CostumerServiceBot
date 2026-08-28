import express from 'express';
import * as whatsappController from '../controllers/whatsapp.controller.js';

const router = express.Router();
router.get('/whatsapp', whatsappController.page);
router.get('/api/whatsapp/status', whatsappController.status);

export default router;
