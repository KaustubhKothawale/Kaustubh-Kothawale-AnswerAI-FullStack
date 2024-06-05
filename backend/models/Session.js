import mongoose from "mongoose";
const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String,  required: true },
  chat:[{
    message: { type: String, required: true },
    response: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
});

export const Session = mongoose.model('Session', sessionSchema);
