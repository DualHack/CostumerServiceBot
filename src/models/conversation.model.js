import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

conversationSchema.index({ customer: 1 }, { unique: true });

export default mongoose.model('Conversation', conversationSchema);
