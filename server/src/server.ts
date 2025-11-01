import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import questionsRouter from './routes/questions';
import quizzesRouter from './routes/quizzes';
import adminRouter from './routes/admin';
import analyticsRouter from './routes/analytics';
import leaderboardRouter from './routes/leaderboardRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running!' });
});

// Routes
app.use('/api/admin', adminRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/leaderboard', leaderboardRouter);

// Error handling
app.use(errorHandler);

// Start server
async function start() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start();
