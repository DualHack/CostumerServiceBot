import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import app from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

describe('API', () => {
  it('retorna o status da aplicação no health check', async () => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { status: 'ok' });
  });

  it('rejeita envio sem destinatário ou mensagem', async () => {
    const response = await fetch(`${baseUrl}/api/messages/send`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({})
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(body, { error: 'Informe to e message.' });
  });
});
