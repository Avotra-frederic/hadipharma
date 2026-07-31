import { model, Schema } from 'mongoose';

const subscriptionHistorySchema = new Schema({
  pharmacy: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true, index: true },
  status: { type: String, enum: ['requested', 'active', 'expired', 'rejected'], required: true },
  startDate: Date,
  endDate: Date,
  features: { type: [String], default: [] },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  note: String,
}, { timestamps: true });

subscriptionHistorySchema.index({ pharmacy: 1, createdAt: -1 });
export default model('SubscriptionHistory', subscriptionHistorySchema);
