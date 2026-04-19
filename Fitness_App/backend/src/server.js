import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import http from 'http';

const app = express();

// =========================
// 🔐 SECURITY & MIDDLEWARE
// =========================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ✅ FIXED CORS (IMPORTANT)
const allowedOrigins = [
  'http://localhost:5173',
  'https://fitverse.vercel.app',
  'https://fitverse-fwvu0mpvv-raghus-projects-b7146480.vercel.app'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests without origin (like Postman)
      if (!origin) return callback(null, true);

      // allow localhost (any port)
      if (origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }

      // allow production domains
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error('❌ Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());

// =========================
// 🚀 ROUTES
// =========================
import aiRoutes from './routes/ai.routes.js';
import workoutRoutes from './routes/workout.routes.js';
import exerciseRoutes from './routes/exercise.routes.js';

app.use('/api/ai', aiRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exerciseRoutes);

// =========================
// ❤️ HEALTH CHECK
// =========================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Fitverse API is running 🚀',
  });
});

// =========================
// ⚙️ SERVER SETUP
// =========================
const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// =========================
// 🧠 OPTIONAL: DATABASE
// =========================
// Uncomment when you add MongoDB

/*
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
  })
  .catch(err => console.error('❌ MongoDB error:', err));
*/