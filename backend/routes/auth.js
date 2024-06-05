import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jwt-simple';
import { User } from '../models/User.js';
import { config } from '../config.js';
import { auth } from '../middleware/auth.js';
import sendVerificationEmail from '../utils/emailSender.js';
import generateVerificationToken from '../utils/jwtVerificationToken.js';
import jwt2 from 'jsonwebtoken'; 
const router = express.Router();

router.post('/register', async (req, res) => {
    console.log("register called");
  const { username, password,email } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword , email:email});
    await user.save();
    console.log(user);
    const token = generateVerificationToken(user._id);
    await sendVerificationEmail(email, token);
    
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'User registration failed', error });
  }
});
router.get('/verify-email',async  (req, res) => {
  console.log("verify email called");
  const { token } = req.query;

  try {
    const decoded = jwt2.verify(token, process.env.JWT_SECRET);
    const user =  await User.findById(decoded.userId);

    if (!user) {
      console.log("Invalid token");
      return res.status(400).json({ message: 'Invalid token.' });
    }
    user.isEmailVerified = true;
    user.save();
    console.log("user verified!!!",user);
    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isEmailVerified) return res.status(400).json({ message: 'Email not verified' });
    const token = jwt.encode({ id: user._id }, config.secretKey);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: 'Login failed', error });
  }
});

router.get('/user', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user._id, 'username email tokenUsage tokenUsageLimit lastReset ');
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: 'Failed to fetch user info', error });
    }
  });

export const authRoutes= router;
