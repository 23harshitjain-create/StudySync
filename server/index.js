import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import studentsRouter from './routes/students.js';
import assignmentsRouter from './routes/assignments.js';
import groupsRouter from './routes/groups.js';
import matchesRouter from './routes/matches.js';
import { dataStore } from './store/dataStore.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Routes
app.use('/api/students', studentsRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/matches', matchesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'StudySync API',
    timestamp: new Date().toISOString(),
    stats: {
      students: dataStore.getStudents().length,
      assignments: dataStore.getAssignments().length,
      groups: dataStore.getGroups().length
    }
  });
});

// Socket.io real-time connection handler (foundation ready)
io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // Join a group study room
  socket.on('join_group_room', ({ groupId, studentName }) => {
    socket.join(groupId);
    console.log(`[Socket] ${studentName} joined room: ${groupId}`);
    io.to(groupId).emit('user_joined', { studentName, timestamp: new Date().toISOString() });
  });

  // Handle incoming message
  socket.on('send_group_message', ({ groupId, message }) => {
    const savedMsg = dataStore.addMessage(groupId, message);
    io.to(groupId).emit('receive_group_message', savedMsg);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 StudySync API Server running on http://0.0.0.0:${PORT}`);
});
