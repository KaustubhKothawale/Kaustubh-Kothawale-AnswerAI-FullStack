import express from 'express';
import { Session } from '../models/Session.js';
import { auth } from '../middleware/auth.js';
const router = express.Router();

router.get('/history', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id }).populate('user', 'username');
    res.json(sessions);
  } catch (error) {
    res.status(400).json({ message: 'Failed to fetch session history', error });
  }
});
export const sessionRoutes  = router;
