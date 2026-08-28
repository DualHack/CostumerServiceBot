import Message from '../models/message.model.js';
import Memory from '../models/memory.model.js';

function createMessage(data) {
  return Message.create(data);
}

function getConversationContext(customer, conversation) {
  return Promise.all([
    Message.find({ conversation: conversation._id }).sort({ createdAt: -1 }).limit(20).exec(),
    Memory.find({ customer: customer._id }).sort({ key: 1 }).exec()
  ]).then(function (parts) {
    const history = [...parts[0]];
    history.reverse();
    return {
      history: history,
      memories: parts[1],
      context: {
        isNewUser: false,
        hasMemory: parts[1].length > 0
      }
    };
  });
}

export { createMessage, getConversationContext };
