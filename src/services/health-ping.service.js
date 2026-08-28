import http from 'node:http';

const TEN_MINUTES = 10 * 60 * 1000;
let intervalId;

function pingHealthEndpoint(port) {
  const request = http.get(`http://127.0.0.1:${port}/health`, (response) => {
    response.resume();
    console.log(`Health check interno: HTTP ${response.statusCode}`);
  });

  request.setTimeout(10_000, () => request.destroy(new Error('Health check expirou.')));
  request.on('error', (error) => {
    console.error('Falha no health check interno:', error.message);
  });
}

function startHealthPing(port) {
  if (intervalId) return;

  pingHealthEndpoint(port);
  intervalId = setInterval(() => pingHealthEndpoint(port), TEN_MINUTES);
}

export { startHealthPing };
