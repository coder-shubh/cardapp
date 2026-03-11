import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    platform: { type: String, default: 'custom' },
    title: { type: String, required: true },
    url: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

linkSchema.set('toJSON', {
  transform(_doc, ret: Record<string, unknown>) {
    const out: Record<string, unknown> = { ...ret, id: (ret._id as { toString(): string })?.toString(), user_id: (ret.user_id as { toString?: () => string })?.toString?.() ?? ret.user_id };
    delete out._id;
    delete out.__v;
    return out;
  },
});

export const Link = mongoose.model('Link', linkSchema);
