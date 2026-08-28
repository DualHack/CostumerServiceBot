import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  whatsappId: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  name: { type: String, default: '' },
  lastSeenAt: { type: Date, default: Date.now }
}, { timestamps: true });

customerSchema.index({ company: 1, whatsappId: 1 }, { unique: true });

export default mongoose.model('Customer', customerSchema);
