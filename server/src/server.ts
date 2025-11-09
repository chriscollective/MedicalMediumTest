// ============================================
// 🚨 CRITICAL: 必須最先載入環境變數！
// ============================================
// 在 import 任何其他模組之前先載入 .env
// 因為 middleware/auth.ts 需要 JWT_SECRET
import dotenv from "dotenv";
dotenv.config();

// 現在可以安全地 import 其他模組了
import express from "express";
import cors from "cors";
import { connectDatabase } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import questionsRouter from "./routes/questions";
import quizzesRouter from "./routes/quizzes";
import adminRouter from "./routes/admin";
import analyticsRouter from "./routes/analytics";
import leaderboardRouter from "./routes/leaderboardRoutes";
import booksRouter from "./routes/books";
import reportsRouter from "./routes/reports";

// ============================================
// 環境變數驗證（啟動時檢查）
// ============================================
console.log("🔍 驗證環境變數...");

const requiredEnvVars = [
  { name: "MONGODB_URI", description: "MongoDB 連線字串" },
  { name: "JWT_SECRET", description: "JWT 加密金鑰", minLength: 32 },
];

const missingVars: string[] = [];
const weakVars: string[] = [];

requiredEnvVars.forEach(({ name, description, minLength }) => {
  const value = process.env[name];

  if (!value) {
    missingVars.push(`  ❌ ${name} - ${description}`);
  } else if (minLength && value.length < minLength) {
    weakVars.push(
      `  ⚠️  ${name} - 長度不足 (${value.length} < ${minLength} 字元)`
    );
  } else {
    console.log(`  ✅ ${name} - 已設定`);
  }
});

if (missingVars.length > 0) {
  console.error("\n❌ 缺少必要的環境變數：\n" + missingVars.join("\n"));
  console.error("\n請在 .env 文件中設定這些變數。");
  console.error("參考 .env.example 檔案。\n");
  process.exit(1);
}

if (weakVars.length > 0) {
  console.error("\n⚠️  環境變數強度不足：\n" + weakVars.join("\n"));
  console.error("\n為了安全性，請使用更強的值。\n");
  process.exit(1);
}

console.log("✅ 所有環境變數驗證通過\n");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 設定 - 允許前端域名
const allowedOrigins = [
  "http://localhost:5173", // 本地開發
  "http://localhost:3000", // 本地開發（備用端口）
  "https://medical-medium-test.vercel.app",
  "https://mmquiz.vercel.app", // Vercel 生產環境
  process.env.FRONTEND_URL, // 環境變數指定的前端 URL
].filter(Boolean); // 過濾掉 undefined

app.use(
  cors({
    origin: function (origin, callback) {
      // 允許沒有 origin 的請求（如 Postman、curl）
      if (!origin) return callback(null, true);

      // 檢查 origin 是否在允許列表中
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // 允許攜帶 Cookie
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Basic health check route
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running!" });
});

// Ping route
app.get("/api/ping", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "pong",
    time: new Date().toISOString(),
  });
});

// Routes
app.use("/api/admin", adminRouter);
app.use("/api/questions", questionsRouter);
app.use("/api/quizzes", quizzesRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/books", booksRouter);
app.use("/api/reports", reportsRouter);

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
