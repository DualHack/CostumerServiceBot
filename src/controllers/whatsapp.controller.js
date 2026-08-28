import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as whatsappService from '../services/whatsapp.service.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function page(request, response) {
  response.sendFile(join(__dirname, '..', 'views', 'whatsapp.html'));
}

function status(request, response) {
  response.json(whatsappService.getStatus());
}

export { page, status };
