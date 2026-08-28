import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

conversationSchema.index({ company: 1, customer: 1 }, { unique: true });

export default mongoose.model('Conversation', conversationSchema);
