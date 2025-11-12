const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const User = require('./models/User');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.json());
app.use(cookieParser());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/chat_app';

mongoose.connect(MONGO).then(()=>console.log('Mongo connected')).catch(err=>console.error(err));

// --- Auth routes ---
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if(!name || !email || !password) return res.status(400).json({msg:'missing fields'});
    const existing = await User.findOne({email});
    if(existing) return res.status(400).json({msg:'email exists'});
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({name, email, password:hashed});
    await user.save();
    const token = jwt.sign({id:user._id}, JWT_SECRET, {expiresIn:'7d'});
    res.json({token, user:{id:user._id,name:user.name,email:user.email}});
  } catch(e){ console.error(e); res.status(500).json({msg:'server error'})}
});

app.post('/auth/login', async (req, res) => {
  try{
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(!user) return res.status(400).json({msg:'invalid credentials'});
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(400).json({msg:'invalid credentials'});
    const token = jwt.sign({id:user._id}, JWT_SECRET, {expiresIn:'7d'});
    res.json({token, user:{id:user._id,name:user.name,email:user.email}});
  }catch(e){console.error(e);res.status(500).json({msg:'server error'})}
});

// simple auth middleware
const auth = (req,res,next)=>{
  const authHeader = req.headers.authorization;
  if(!authHeader) return res.status(401).json({msg:'no token'});
  const token = authHeader.split(' ')[1];
  try{
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  }catch(e){ return res.status(401).json({msg:'invalid token'})}
};

// get users (all users)
app.get('/users', auth, async (req,res)=>{
  const users = await User.find({_id:{ $ne: req.userId }}).select('-password');
  res.json(users);
});

// conversation messages
app.get('/conversations/:id/messages', auth, async (req,res)=>{
  const convId = req.params.id;
  const msgs = await Message.find({conversation:convId}).sort({createdAt:1});
  res.json(msgs);
});

// create or get conversation between two users
app.post('/conversations', auth, async (req,res)=>{
  const {participantId} = req.body;
  if(!participantId) return res.status(400).json({msg:'participant required'});
  let conv = await Conversation.findOne({participants: {$all: [req.userId, participantId]}});
  if(!conv){
    conv = new Conversation({participants:[req.userId, participantId]});
    await conv.save();
  }
  res.json(conv);
});

// --- Socket.IO ---
const onlineUsers = {}; // userId -> socketId

io.use(async (socket, next) => {
  // token passed in query
  const token = socket.handshake.auth?.token;
  if(!token) return next();
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    socket.userId = payload.id;
    next();
  }catch(e){ next(); }
});

io.on('connection', (socket) => {
  if(socket.userId){
    onlineUsers[socket.userId] = socket.id;
    io.emit('user:online', {userId: socket.userId});
  }

  socket.on('message:send', async (data) => {
    // data: {conversationId, to, content}
    const {conversationId, to, content} = data;
    const msg = new Message({
      conversation: conversationId,
      from: socket.userId,
      to,
      content,
      status: 'delivered'
    });
    await msg.save();
    io.to(socket.id).emit('message:new', msg); // echo to sender
    const targetSocket = onlineUsers[to];
    if(targetSocket){
      io.to(targetSocket).emit('message:new', msg);
    }
  });

  socket.on('typing:start', (data) => {
    // {to, conversationId}
    io.to(onlineUsers[data.to]).emit('typing:start', {from: socket.userId, conversationId: data.conversationId});
  });
  socket.on('typing:stop', (data) => {
    io.to(onlineUsers[data.to]).emit('typing:stop', {from: socket.userId, conversationId: data.conversationId});
  });

  socket.on('message:read', async (data) => {
    // data: {messageId, conversationId}
    const m = await Message.findByIdAndUpdate(data.messageId, {status:'read'}, {new:true});
    if(m && onlineUsers[m.from]) {
      io.to(onlineUsers[m.from]).emit('message:read', {messageId: m._id, conversationId: data.conversationId});
    }
  });

  socket.on('disconnect', () => {
    if(socket.userId){
      delete onlineUsers[socket.userId];
      io.emit('user:offline', {userId: socket.userId});
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, ()=> console.log('Server running on', PORT));
