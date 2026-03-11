import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // view | click | qr | nfc
    link_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', default: null },
    date: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

analyticsEventSchema.set('toJSON', {
  transform(_doc, ret: Record<string, unknown>) {
    const out: Record<string, unknown> = { ...ret, id: (ret._id as { toString(): string })?.toString(), user_id: (ret.user_id as { toString?: () => string })?.toString?.() ?? ret.user_id, link_id: (ret.link_id as { toString?: () => string })?.toString?.() ?? ret.link_id ?? null };
    delete out._id;
    delete out.__v;
    return out;
  },
});

export const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
