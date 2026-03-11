import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, default: null },
    phone: { type: String, default: null },
    profile_image: { type: String, default: null },
    theme_color: { type: String, default: '#6366f1' },
    dark_mode: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

userSchema.set('toJSON', {
  transform(_doc, ret: Record<string, unknown>) {
    const out: Record<string, unknown> = { ...ret, id: (ret._id as { toString(): string })?.toString() };
    delete out._id;
    delete out.__v;
    delete out.password;
    return out;
  },
});

export const User = mongoose.model('User', userSchema);
