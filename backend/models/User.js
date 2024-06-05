import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  tokenUsage: { type: Number, default: 0 },
  tokenUsageLimit: { type: Number, default: 1000 },
  lastReset: { type: Date, default: Date.now },
  email:{ type: String },
  isEmailVerified: { type: Boolean, default: false },
});


export const User = mongoose.model('User', userSchema);