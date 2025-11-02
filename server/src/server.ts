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
import booksRouter from './routes/books';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 設定 - 允許前端域名
const allowedOrigins = [
  'http://localhost:5173',           // 本地開發
  'http://localhost:3000',           // 本地開發（備用端口）
  'https://medical-medium-test.vercel.app', // Vercel 生產環境
  process.env.FRONTEND_URL           // 環境變數指定的前端 URL
].filter(Boolean); // 過濾掉 undefined

app.use(cors({
  origin: function (origin, callback) {
    // 允許沒有 origin 的請求（如 Postman、curl）
    if (!origin) return callback(null, true);

    // 檢查 origin 是否在允許列表中
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // 允許攜帶 Cookie
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
app.use('/api/books', booksRouter);

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
