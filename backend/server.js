import express from 'express';
import cors from 'cors';
import {hash , compare} from 'bcrypt';
import jwt from 'jsonwebtoken';
import OpenAI from "openai";
import bodyParser from 'body-parser'; 
import mongoose from 'mongoose';


const uri = "mongodb+srv://kaustubhanilkothawale:XvZj27RNqK9Jvn1D@cluster0.gmqjsy9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await mongoose.disconnect();
  }
}
run().catch(console.dir);


const app = express();
const port = 3002;

const users = {
    Kaustubh: {
    password: '$2b$10$XDz93vYMTwNlv1bWnnNl3ezq7u2R8q824XTL0MzEMGIgZkBBtVTF.'
  }
}; 
const openai = new OpenAI({
    organization: "org-UYVvApVjTbv9cFeb5fBk4bVY",
    project: "proj_qXPqIqemrGmJHy55YKfuTJ88",
    // apiKey:OPENAI_API_KEY
});

const SECRET_KEY = 'Kaustubh_Kothawale_Answer_AI';

app.use(cors());
app.use(bodyParser.json());

// User registration endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (users[username]) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await hash(password, 10);
  users[username] = { password: hashedPassword };

  res.json({ message: 'User registered successfully' });
  console.log(users);
});

// User login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users[username];
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const validPassword = await compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

  res.json({ token });
});

// Chat endpoint (protected)
app.post('/chat', async (req, res) => {
  const { token, message } = req.body;
  try {
    jwt.verify(token, SECRET_KEY);

    console.log('Processing message:', message);
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: message }],
        model: "gpt-3.5-turbo",
    });
    console.log(completion);
    console.log(completion.choices[0].message.content);
    const botResponse = completion.choices[0].message.content;
    res.json({ reply: botResponse });
    // res.json({ reply: msg });
    } catch (error) {
      console.error('Error processing message:', error);
      res.status(500).json({ message: 'Error processing message' });
    }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});