import * as whatsappService from '../services/whatsapp.service.js';

function send(request, response) {
  const body = request.body || {};
  if (!body.to || !body.message) {
    return response.status(400).json({ error: 'Informe to e message.' });
  }

  return whatsappService.sendMessage(body.to, body.message)
    .then(function (result) {
      response.json({ success: true, id: result.id ? result.id.id : null });
    })
    .catch(function (error) {
      response.status(503).json({ error: error.message });
    });
}

export { send };
