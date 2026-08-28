import whatsapp from 'whatsapp-web.js';
import qrcode from 'qrcode';
import env from '../config/env.js';
import * as incomingMessageService from './incoming-message.service.js';

const client = new whatsapp.Client({
  authStrategy: new whatsapp.LocalAuth({ dataPath: env.whatsappSessionPath }),
  puppeteer: {
    headless: true,
    executablePath: env.puppeteerExecutablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ],
  },
});
const state = { status: 'disconnected', qrCode: null, error: null, phone: null };
let readyPromise = null;
const messageQueues = {};

function startTyping(message) {
  return Promise.resolve()
    .then(function () {
      return message.getChat();
    })
    .then(function (chat) {
      return chat.sendStateTyping().then(function () {
        const typingInterval = setInterval(function () {
          chat.sendStateTyping().catch(function () {});
        }, 10_000);

        return { chat: chat, typingInterval: typingInterval };
      });
    })
    .catch(function () {
      return null;
    });
}

function clearTyping(typingState) {
  if (!typingState) return Promise.resolve();

  clearInterval(typingState.typingInterval);
  return Promise.resolve(typingState.chat?.clearState ? typingState.chat.clearState() : null);
}

function sendReply(message, text) {
  return client
    .sendMessage(message.from, text, {
      quotedMessageId: message.id && (message.id._serialized || message.id.id),
    })
    .then(function (sentMessage) {
      console.log("Mensagem enviada para " + message.from);
      return sentMessage;
    });
}

function enqueueMessage(message) {
  if (!incomingMessageService.isProcessableMessage(message))
    return Promise.resolve();

  console.log("Mensagem recebida de " + message.from);
  const queueId = message.from;
  const previous = messageQueues[queueId] || Promise.resolve();
  const typingPromise = startTyping(message);
  const task = previous.then(function () {
    let typingState;
    return typingPromise.then(function (startedTyping) {
      typingState = startedTyping;
      return incomingMessageService
        .processIncomingMessage(message, {
          startTyping: function () {
            return Promise.resolve(typingState ? typingState.chat : null);
          },
          sendReply: sendReply,
        })
        .then(function (result) {
          return result;
        });
    }).then(function () {
      return clearTyping(typingState);
    });
  });

  const queuedTask = task.then(
    function () {
      if (messageQueues[queueId] === queuedTask) delete messageQueues[queueId];
    },
    function () {
      if (messageQueues[queueId] === queuedTask) delete messageQueues[queueId];
    },
  );
  messageQueues[queueId] = queuedTask;
  return task;
}

client.on("qr", function (code) {
  state.status = "qr";
  state.error = null;
  qrcode.toDataURL(code, function (error, dataUrl) {
    if (!error) state.qrCode = dataUrl;
  });
});
client.on("authenticated", function () {
  state.status = "authenticated";
  state.error = null;
});
client.on("ready", function () {
  state.status = "ready";
  state.qrCode = null;
  state.phone = client.info?.wid ? client.info.wid.user : null;
  console.log("WhatsApp conectado.");
});
client.on("auth_failure", function (error) {
  state.status = "error";
  state.error = error;
});
client.on("disconnected", function (reason) {
  state.status = "disconnected";
  state.phone = null;
  state.error = reason;
});
client.on("message", enqueueMessage);

function initialize() {
  if (!readyPromise) {
    state.status = "connecting";
    readyPromise = client.initialize().catch(function (error) {
      state.status = "error";
      state.error = error.message;
      readyPromise = null;
      throw error;
    });
  }
  return readyPromise;
}

function getStatus() {
  return {
    status: state.status,
    qrCode: state.qrCode,
    phone: state.phone,
    error: state.error ? String(state.error) : null,
  };
}

function sendMessage(to, text) {
  const destination = String(to).replace(/\D/g, '') + '@c.us';
  return client.sendMessage(destination, text);
}

export { initialize, getStatus, sendMessage };
