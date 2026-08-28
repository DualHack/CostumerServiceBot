import Message from '../models/message.model.js';
import Memory from '../models/memory.model.js';

function createMessage(data) {
  return Message.create(data);
}

function getConversationContext(company, customer, conversation) {
  return Promise.all([
    Message.find({ conversation: conversation._id }).sort({ createdAt: -1 }).limit(20).exec(),
    Memory.find({ company: company._id, customer: customer._id }).sort({ key: 1 }).exec()
  ]).then(function (parts) {
    return { history: parts[0].reverse(), memories: parts[1] };
  });
}

export { createMessage, getConversationContext };
