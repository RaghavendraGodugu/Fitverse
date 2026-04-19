import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';

const app = express();

// Security & Middleware (cross-origin friendly for browser clients on another port)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors({
  origin: function (origin, callback) {
    // Allow any localhost port (Vite sometimes uses 5174, 5175, etc if 5173 is occupied)
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, process.env.CLIENT_URL || 'http://localhost:5173');
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
import aiRoutes from './routes/ai.routes.js';
import workoutRoutes from './routes/workout.routes.js';
import exerciseRoutes from './routes/exercise.routes.js';

app.use('/api/ai', aiRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exerciseRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Fitverse API is running' });
});

// Setup DB & Server
const PORT = process.env.PORT || 5001;

// Uncomment when MongoDB URI is set up
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('MongoDB Connected');
//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//   })
//   .catch(err => console.error('MongoDB connection error:', err));

import http from 'http';
const server = http.createServer(app);

// For now, start without DB
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[backend] Port ${PORT} is already in use. Stop the other process or set PORT in backend/.env`
    );
  } else {
    console.error('[backend] Server error:', err);
  }
  process.exit(1);
});
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
