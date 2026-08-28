import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  whatsappId: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  name: { type: String, default: '' },
  lastSeenAt: { type: Date, default: Date.now }
}, { timestamps: true });

customerSchema.index({ whatsappId: 1 }, { unique: true });

export default mongoose.model('Customer', customerSchema);
