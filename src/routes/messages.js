import express from 'express';
import * as messagesController from '../controllers/messages.controller.js';

const router = express.Router();
router.post('/api/messages/send', messagesController.send);

export default router;
