import Conversation from '../models/conversation.model.js';

function getOrCreateConversation(customer) {
  return Conversation.findOneAndUpdate(
    { customer: customer._id },
    {
      $set: { lastMessageAt: new Date() },
      $setOnInsert: { customer: customer._id }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export { getOrCreateConversation };
