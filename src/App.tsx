import React, { useState, useEffect } from "react";
import { LandingPage } from "./pages/LandingPage";
import { QuizPage } from "./pages/QuizPage";
import { ResultPage } from "./pages/ResultPage";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Analytics } from "./pages/Analytics";
import { QuestionBank } from "./pages/QuestionBank";
import { Leaderboard } from "./pages/Leaderboard";
import { About } from "./pages/About";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { Question } from "./components/QuestionCard";
import { getToken, getCurrentUser } from "./services/authService";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

type AppPage =
  | "landing"
  | "quiz"
  | "result"
  | "admin-login"
  | "admin-dashboard"
  | "analytics"
  | "questions"
  | "leaderboard"
  | "about"
  | "privacy-policy";

interface QuizState {
  books: string[];
  difficulty: "beginner" | "advanced";
  answers: Record<string, string | string[]>;
  score: number;
  totalQuestions: number;
  wrongQuestions: Array<{
    question: Question;
    userAnswer: string | string[];
  }>;
}

// 測驗總題數常數
const QUIZ_TOTAL_QUESTIONS = 20;

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>("landing");
  const [quizState, setQuizState] = useState<QuizState>({
    books: [],
    difficulty: "beginner",
    answers: {},
    score: 0,
    totalQuestions: 0,
    wrongQuestions: [],
  });
  const [adminUser, setAdminUser] = useState<string>("");
  const [leaderboardSource, setLeaderboardSource] = useState<
    "landing" | "admin-dashboard"
  >("landing");

  // Check if user is already logged in on page load
  useEffect(() => {
    const token = getToken();
    const currentUser = getCurrentUser();

    if (token && currentUser) {
      setAdminUser(currentUser.username);
      // Restore the admin page from localStorage if available
      const savedPage = localStorage.getItem("adminCurrentPage");
      if (
        savedPage &&
        (savedPage === "admin-dashboard" ||
          savedPage === "analytics" ||
          savedPage === "questions")
      ) {
        setCurrentPage(savedPage as AppPage);
      } else {
        setCurrentPage("admin-dashboard");
      }
    }
  }, []);

  const handleStartQuiz = (
    books: string[],
    difficulty: "beginner" | "advanced"
  ) => {
    setQuizState({
      books,
      difficulty,
      answers: {},
      score: 0,
      totalQuestions: QUIZ_TOTAL_QUESTIONS,
      wrongQuestions: [],
    });
    setCurrentPage("quiz");
  };

  const handleQuizComplete = (result: {
    score: number;
    totalQuestions: number;
    wrongQuestions: Array<{
      question: Question;
      userAnswer: string | string[];
    }>;
    answers: Record<string, string | string[]>;
  }) => {
    setQuizState((prev) => ({
      ...prev,
      answers: result.answers,
      score: result.score,
      totalQuestions: result.totalQuestions,
      wrongQuestions: result.wrongQuestions,
    }));
    setCurrentPage("result");
  };

  const handleRestartQuiz = () => {
    setCurrentPage("landing");
  };

  const handleAdminLogin = (username: string) => {
    setAdminUser(username);
    setCurrentPage("admin-dashboard");
    // Save the dashboard page to localStorage
    localStorage.setItem("adminCurrentPage", "admin-dashboard");
  };

  const handleAdminLogout = () => {
    setAdminUser("");
    setCurrentPage("landing");
    // Clear the saved admin page from localStorage
    localStorage.removeItem("adminCurrentPage");
  };

  const handleAdminNavigate = (
    page: "analytics" | "questions" | "leaderboard"
  ) => {
    if (page === "leaderboard") {
      setLeaderboardSource("admin-dashboard");
    }
    setCurrentPage(page);
    // Save the current admin page to localStorage
    localStorage.setItem("adminCurrentPage", page);
  };

  return (
    <div className="min-h-screen">
      {currentPage === "landing" && (
        <LandingPage
          onStart={handleStartQuiz}
          onAdminClick={() => setCurrentPage("admin-login")}
          onLeaderboardClick={() => {
            setLeaderboardSource("landing");
            setCurrentPage("leaderboard");
          }}
          onAboutClick={() => setCurrentPage("about")}
          onPrivacyClick={() => setCurrentPage("privacy-policy")}
        />
      )}

      {currentPage === "quiz" && (
        <QuizPage
          books={quizState.books}
          difficulty={quizState.difficulty}
          onComplete={handleQuizComplete}
          onBack={() => setCurrentPage("landing")}
        />
      )}

      {currentPage === "result" && (
        <ResultPage
          score={quizState.score}
          totalQuestions={quizState.totalQuestions}
          wrongQuestions={quizState.wrongQuestions}
          books={quizState.books}
          difficulty={quizState.difficulty}
          userId={localStorage.getItem("quizUserId") || `user_${Date.now()}`}
          onRestart={handleRestartQuiz}
          onHome={() => setCurrentPage("landing")}
        />
      )}

      {currentPage === "admin-login" && (
        <AdminLogin
          onLogin={handleAdminLogin}
          onBack={() => setCurrentPage("landing")}
        />
      )}

      {currentPage === "admin-dashboard" && (
        <AdminDashboard
          username={adminUser}
          onNavigate={handleAdminNavigate}
          onLogout={handleAdminLogout}
        />
      )}

      {currentPage === "analytics" && (
        <Analytics onBack={() => setCurrentPage("admin-dashboard")} />
      )}

      {currentPage === "questions" && (
        <QuestionBank onBack={() => setCurrentPage("admin-dashboard")} />
      )}

      {currentPage === "leaderboard" && (
        <Leaderboard onBack={() => setCurrentPage(leaderboardSource)} />
      )}

      {currentPage === "about" && (
        <About onBack={() => setCurrentPage("landing")} />
      )}

      {currentPage === "privacy-policy" && (
        <PrivacyPolicy onBack={() => setCurrentPage("landing")} />
      )}

      {/* Vercel Analytics - 追蹤網站流量 */}
      <VercelAnalytics />
    </div>
  );
}

export default App;
