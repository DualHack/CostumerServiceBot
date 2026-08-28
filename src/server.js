import app from './app.js';
import env from './config/env.js';
import { connectDatabase } from './config/database.js';
import * as whatsappService from './services/whatsapp.service.js';
import { startHealthPing } from './services/health-ping.service.js';

try {
  await connectDatabase();

  const server = app.listen(env.port, function () {
    console.log(`Abre HTTP em http://localhost:${env.port}/whatsapp`);
    startHealthPing(env.port);
  });

  server.on('error', function (error) {
    console.error('Falha ao iniciar o servidor HTTP:', error.message);
    process.exitCode = 1;
  });

  try {
    await whatsappService.initialize();
  } catch (error) {
    console.error('Falha ao iniciar o WhatsApp:', error.message);
  }
} catch (error) {
  console.error('Falha ao iniciar o bot:', error.message);
  process.exitCode = 1;
}
