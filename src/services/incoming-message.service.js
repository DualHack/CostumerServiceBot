import { generateReply } from '../ai/openrouter.js';
import * as customerService from './customer.service.js';
import * as conversationService from './conversation.service.js';
import * as messageService from './message.service.js';

function isProcessableMessage(message) {
  return message && !message.fromMe && message.from !== 'status@broadcast' && Boolean(message.body);
}

function processIncomingMessage(message, transport) {
  if (!isProcessableMessage(message)) return Promise.resolve();

  let stage = 'cliente';
  const whatsappId = message.from;
  const customerName = message._data?.notifyName;

  return Promise.resolve()
    .then(function () { return transport.startTyping(message); })
    .then(function () {
      return customerService.getOrCreateCustomer(whatsappId, customerName);
    })
    .then(function (customerResult) {
      return { customer: customerResult.customer, isNewUser: customerResult.isNewUser };
    })
    .then(function (context) {
      stage = 'conversa';
      return conversationService.getOrCreateConversation(context.customer)
        .then(function (conversation) {
          return { customer: context.customer, conversation: conversation, isNewUser: context.isNewUser };
        });
    })
    .then(function (context) {
      stage = 'mensagem recebida';
      return messageService.createMessage({
        customer: context.customer._id,
        conversation: context.conversation._id,
        role: 'customer',
        content: message.body,
        whatsappMessageId: message.id && (message.id.id || message.id._serialized)
      }).then(function () { return context; });
    })
    .then(function (context) {
      stage = 'OpenRouter';
      return messageService.getConversationContext(
        context.customer,
        context.conversation
      ).then(function (conversationContext) {
        return generateReply({
          customer: context.customer,
          history: conversationContext.history,
          memories: conversationContext.memories,
          context: {
            isNewUser: context.isNewUser,
            hasMemory: conversationContext.memories.length > 0
          },
          incomingMessage: message.body
        }).then(function (reply) {
          return { context: context, reply: reply };
        });
      });
    })
    .then(function (result) {
      stage = 'envio WhatsApp';
      const context = result.context;
      return messageService.createMessage({
        customer: context.customer._id,
        conversation: context.conversation._id,
        role: 'assistant',
        content: result.reply
      }).then(function () {
        return transport.sendReply(message, result.reply);
      });
    })
    .catch(function (error) {
      console.error('Erro na etapa ' + stage + ':', error.message);
    });
}

export { isProcessableMessage, processIncomingMessage };
