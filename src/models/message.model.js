import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  role: { type: String, enum: ['customer', 'assistant'], required: true },
  content: { type: String, required: true },
  whatsappMessageId: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
