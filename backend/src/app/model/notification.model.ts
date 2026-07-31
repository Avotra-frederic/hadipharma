import { model, Schema } from 'mongoose';

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  pharmacy: { type: Schema.Types.ObjectId, ref: 'Pharmacy' },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false, index: true },
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });

export default model('Notification', notificationSchema);
