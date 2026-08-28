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
Build Command: PUPPETEER_CACHE_DIR=.cache/puppeteer npm install && PUPPETEER_CACHE_DIR=.cache/puppeteer npx puppeteer browsers install chrome
Start Command: npm start
```

Configure estas variáveis no Render:

Não é necessária nenhuma variável adicional para o health check interno.

O Puppeteer instala o Chrome em `.cache/puppeteer`, dentro do diretório publicado da aplicação. Remova do Render qualquer variável `PUPPETEER_CACHE_DIR` ou `PUPPETEER_EXECUTABLE_PATH` antiga. O `LocalAuth` salva a sessão em `path.join(process.cwd(), '.wwebjs_auth')`; a sessão não é persistente no Render e um novo QR Code poderá ser solicitado após reinícios ou redeploys.

Abra `http://localhost:3000/whatsapp`. Na primeira execução, escaneie o QR Code pelo WhatsApp. A autenticação fica em `.wwebjs_auth`, permitindo reutilizar a sessão após reiniciar o servidor.

O endpoint `/health` fica disponível assim que a API HTTP inicia. A aplicação chama essa rota internamente ao iniciar e a cada 10 minutos.

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
