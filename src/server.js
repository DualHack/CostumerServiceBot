import app from './app.js';
import env from './config/env.js';
import { connectDatabase } from './config/database.js';
import * as whatsappService from './services/whatsapp.service.js';
import { startHealthPing } from './services/health-ping.service.js';

connectDatabase()
  .then(function () {
    app.listen(env.port, function () {
      const healthUrl = env.healthUrl || `http://127.0.0.1:${env.port}/health`;
      console.log(`Abre HTTP em http://localhost:${env.port}/whatsapp`);
      startHealthPing(healthUrl);
    });
    return whatsappService.initialize();
  })
  .catch(function (error) {
    console.error("Falha ao iniciar o bot:", error.message);
    process.exitCode = 1;
  });
