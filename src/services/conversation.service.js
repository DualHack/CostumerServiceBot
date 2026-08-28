import Conversation from '../models/conversation.model.js';

function getOrCreateConversation(company, customer) {
  return Conversation.findOneAndUpdate(
    { company: company._id, customer: customer._id },
    {
      $set: { lastMessageAt: new Date() },
      $setOnInsert: { company: company._id, customer: customer._id }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export { getOrCreateConversation };
