import express from 'express';
import axios from 'axios';
import OpenAI from "openai";
import { Session } from '../models/Session.js';
import { auth } from '../middleware/auth.js';
import { config } from '../config.js';
import { v4 as uuidv4} from 'uuid';

const router = express.Router();
const openai = new OpenAI({
    organization: "org-UYVvApVjTbv9cFeb5fBk4bVY",
    project: "proj_qXPqIqemrGmJHy55YKfuTJ88",
});

router.post('/', auth, async (req, res) => {
  console.log("chat called");
  const { message } = req.body;
  const { user } = req;

  const tokensUsed = Math.ceil(message.length / 4); // Approximate token count
  const today = new Date();
  const lastReset = new Date(user.lastReset);

  if (today.toDateString() !== lastReset.toDateString()) {
    user.tokenUsage = 0;
    user.lastReset = today;
  }

  if (user.tokenUsage + tokensUsed > config.dailyTokenLimit) {
    return res.status(429).json({ message: 'Daily token limit exceeded' });
  }

  try {
    console.log('Processing message:', message);
    const response = await openai.chat.completions.create({
        messages: [{ role: "system", content: message }],
        model: "gpt-3.5-turbo",
    });
    console.log(response.choices[0].message.content);
    console.log(response.usage.total_tokens);
    const gptTokensUsed = response.usage.total_tokens;
    console.log(gptTokensUsed);
    const botResponse = response.choices[0].message.content;
    let sessionId=req.body.sessionId
    if(req.body.sessionId){
      const session = await Session.findOne({sessionId: sessionId});
      session.chat.push({message: message, response: botResponse});
      await session.save();
    }
    else{
      sessionId = uuidv4();
      console.log("session id:", sessionId);
      const session = new Session({ user: user._id,sessionId: sessionId, chat: [{message: message, response: botResponse}] });
      await session.save();
    }
    // const chat = new Chat({ user: user._id, message, response: botResponse });
    // await chat.save();

    user.tokenUsage += gptTokensUsed;
    await user.save();

    res.json({ reply: botResponse, tokensUsed: user.tokenUsage, tokenLimit: config.dailyTokenLimit, sessionId: sessionId});
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ message: 'Error processing message', error });
  }
});

export const chatRoutes = router;
