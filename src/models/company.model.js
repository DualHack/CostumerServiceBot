import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  prompt: { type: String, required: true },
  rules: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model('Company', companySchema);
