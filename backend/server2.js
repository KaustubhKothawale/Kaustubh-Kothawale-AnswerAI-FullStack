import express from 'express';
import cors from 'cors';
import {hash , compare} from 'bcrypt';
import jwt from 'jsonwebtoken';
import OpenAI from "openai";
import bodyParser from 'body-parser'; 
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import {authRoutes} from './routes/auth.js';
import {chatRoutes} from './routes/chat.js';
import {sessionRoutes } from './routes/sessions.js';
// import {auth} from './middleware/auth.js';
import dotenv from 'dotenv';
import {Server} from 'socket.io';
import http from 'http';
import { Console } from 'console';
import { config } from './config.js';
import { User } from './models/User.js';
import { v4 as uuidv4} from 'uuid';
import { Session } from './models/Session.js';  

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  }
});
const port = 3002;
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
}));
app.use(bodyParser.json());

const uri = process.env.MONGODB_URI;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
  catch(error){
    console.log("Error connecting to MongoDB",error);
  } finally {
    // Ensures that the client will close when you finish/error
    // await mongoose.disconnect();
  }
}
run().catch(console.dir);

const auth = async (socket, next) => {
  try {
    console.log("auth called");
    const token = socket.handshake.auth.token;
    const decoded = jwt.decode(token, config.secretKey);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error('Authentication error'));
    }
    socket.user = user;
    next();
  } catch (error) {
    console.error(error);
    console.log("auth error",error);
    next(new Error('Authentication error'));
  }
};

io.use(auth);

io.on('connection', (socket) => {
  console.log('User connected:', socket.user.username);
  socket.on('sendMessage', async (message) => {
    console.log("socket backend called", message);
    let sessionId=message.sessionId;
    message = message.message;
    try {
      const { user } = socket;       
      const tokensUsed = Math.ceil(message.length / 4); // Approximate token count
      const today = new Date();
      const lastReset = new Date(user.lastReset);

      if (today.toDateString() !== lastReset.toDateString()) {
        user.tokenUsage = 0;
        user.lastReset = today;
      }

      if (user.tokenUsage + tokensUsed > user.tokenUsageLimit) {
        socket.emit('messageError', 'Daily token limit exceeded');
        return;
      }
      const response = await openai.chat.completions.create({
          messages: [{ role: "system", content: message }],
          model: "gpt-3.5-turbo",
          stream: true,
          stream_options: { include_usage: true },
      });
      let botResponse = "";
      let usageData = null;
      for await (const chunk of response) {
        botResponse += chunk.choices[0]?.delta?.content || "";
        socket.emit('receiveMessage', { sender: 'bot', text: chunk.choices[0]?.delta?.content || "" });
        if (chunk.usage) {
          usageData = chunk.usage;
        }
      }
      
      const gptTokensUsed = usageData ? usageData.total_tokens :Math.ceil((message.length + botResponse.length) / 4);
      
      if(sessionId){
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
      socket.emit('sessionId', { sessionId: sessionId });
      socket.emit('endOfResponse');
      user.tokenUsage += gptTokensUsed;
      await user.save();
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('messageError', 'Error processing message');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.username);
  });
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 10 requests per windowMs
    message: 'Too many requests, please try again later.'
});

const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many requests, please try again later.'
});

const SECRET_KEY = 'Kaustubh_Kothawale_Answer_AI';

app.use('/auth', authLimiter);
// app.use('/chat', chatLimiter);

app.use('/auth', authRoutes);
// app.use('/chat', chatRoutes);
app.use('/sessions', sessionRoutes);

// Chat endpoint (protected)
const openai = new OpenAI({
    organization: "org-UYVvApVjTbv9cFeb5fBk4bVY",
    project: "proj_qXPqIqemrGmJHy55YKfuTJ88",
});


server.listen(port, () => {
  console.log('Server running at http://localhost:3002');
});
export default server;