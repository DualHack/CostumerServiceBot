# WhatsApp AI Bot

Bot de atendimento automático para WhatsApp usando Node.js, `whatsapp-web.js`, MongoDB/Mongoose e OpenRouter.

## Configuração

1. Instale o MongoDB e deixe o serviço em execução.
2. Copie `.env.example` para `.env`.
3. Preencha `OPENROUTER_API_KEY` e `OPENROUTER_MODEL`.
4. Instale as dependências:

```bash
npm install
```

## Execução

```bash
npm start
```

## Deploy no Render

Use Node.js 22. O Render deve usar exatamente estes comandos:

```text
Build Command: npm install && npx puppeteer browsers install chrome
Start Command: npm start
```

Configure estas variáveis no Render:

```text
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
WHATSAPP_SESSION_PATH=/var/data/.wwebjs_auth
```

`WHATSAPP_SESSION_PATH=/var/data/.wwebjs_auth` requer um Persistent Disk montado em `/var/data`. Sem esse disco, a sessão do WhatsApp pode ser perdida após reinícios do serviço.

Abra `http://localhost:3000/whatsapp`. Na primeira execução, escaneie o QR Code pelo WhatsApp. A autenticação fica em `.wwebjs_auth`, permitindo reutilizar a sessão após reiniciar o servidor.

O servidor acessa `/health` imediatamente após iniciar e a cada 10 minutos. Em produção, configure `HEALTH_URL` com a URL pública da aplicação para que um serviço externo de monitoramento também possa manter o servidor ativo.

As informações da empresa, o prompt e as regras são carregados diretamente de `src/util/prompt.js`. A empresa não é salva no MongoDB. O banco armazena apenas clientes, conversas, mensagens e memórias.

## API

- `GET /health`
- `GET /whatsapp`
- `GET /api/whatsapp/status`
- `POST /api/messages/send`

Exemplo de envio:

```json
{
  "to": "244923000000",
  "message": "Olá!"
}
```

O fluxo de mensagens recebidas ignora mensagens do próprio bot, recupera histórico e memória no MongoDB, chama o OpenRouter, salva a resposta e a envia ao mesmo contato.

## Arquitetura

- `src/models`: schemas e modelos Mongoose.
- `src/services`: regras de negócio, integração com IA e WhatsApp.
- `src/controllers`: entrada HTTP e respostas da API.
- `src/routes`: definição dos endpoints e encaminhamento para controllers.
- `src/config`: configurações e conexão com o banco.

O serviço `incoming-message` orquestra o atendimento sem depender do Express. O serviço `whatsapp` funciona como adapter do WhatsApp Web e mantém a fila por contato.
