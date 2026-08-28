import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  key: { type: String, required: true },
  value: { type: String, required: true },
  source: { type: String, default: 'manual' }
}, { timestamps: true });

memorySchema.index({ customer: 1, key: 1 }, { unique: true });

export default mongoose.model('Memory', memorySchema);
