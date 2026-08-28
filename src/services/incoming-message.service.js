import { generateReply } from '../ai/openrouter.js';
import * as companyService from './company.service.js';
import * as customerService from './customer.service.js';
import * as conversationService from './conversation.service.js';
import * as messageService from './message.service.js';

function isProcessableMessage(message) {
  return message && !message.fromMe && message.from !== 'status@broadcast' && Boolean(message.body);
}

function processIncomingMessage(message, transport) {
  if (!isProcessableMessage(message)) return Promise.resolve();

  let stage = 'empresa';
  const whatsappId = message.from;
  const customerName = message._data?.notifyName;

  return Promise.resolve()
    .then(function () { return transport.startTyping(message); })
    .then(function () {
      return companyService.getOrCreateDefaultCompany();
    })
    .then(function (company) {
      stage = 'cliente';
      return customerService.getOrCreateCustomer(company, whatsappId, customerName)
        .then(function (customer) { return { company: company, customer: customer }; });
    })
    .then(function (context) {
      stage = 'conversa';
      return conversationService.getOrCreateConversation(context.company, context.customer)
        .then(function (conversation) {
          return { company: context.company, customer: context.customer, conversation: conversation };
        });
    })
    .then(function (context) {
      stage = 'mensagem recebida';
      return messageService.createMessage({
        company: context.company._id,
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
        context.company,
        context.customer,
        context.conversation
      ).then(function (conversationContext) {
        return generateReply({
          company: context.company,
          customer: context.customer,
          history: conversationContext.history,
          memories: conversationContext.memories,
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
        company: context.company._id,
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
