import http from 'node:http';
import https from 'node:https';

const TEN_MINUTES = 10 * 60 * 1000;
let intervalId;

function pingHealthEndpoint(healthUrl) {
  const url = new URL(healthUrl);
  const client = url.protocol === 'https:' ? https : http;

  const request = client.get(url, (response) => {
    response.resume();
    console.log(`Health check: HTTP ${response.statusCode}`);
  });

  request.setTimeout(10_000, () => request.destroy(new Error('Health check expirou.')));
  request.on('error', (error) => {
    console.error('Falha no health check:', error.message);
  });
}

function startHealthPing(healthUrl) {
  if (intervalId) return;

  pingHealthEndpoint(healthUrl);
  intervalId = setInterval(() => pingHealthEndpoint(healthUrl), TEN_MINUTES);
}

export { startHealthPing };
