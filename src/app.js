import express from 'express';
import whatsappRoutes from './routes/whatsapp.js';
import messageRoutes from './routes/messages.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.get('/health', function (request, response) { response.json({ status: 'ok' }); });
app.use(whatsappRoutes);
app.use(messageRoutes);

export default app;
