import React, { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { QuizPage } from './pages/QuizPage';
import { ResultPage } from './pages/ResultPage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { Analytics } from './pages/Analytics';
import { QuestionBank } from './pages/QuestionBank';
import { Leaderboard } from './pages/Leaderboard';
import { About } from './pages/About';
import { Question } from './components/QuestionCard';
import { getToken, getCurrentUser } from './services/authService';

type AppPage =
  | 'landing'
  | 'quiz'
  | 'result'
  | 'admin-login'
  | 'admin-dashboard'
  | 'analytics'
  | 'questions'
  | 'leaderboard'
  | 'about';

interface QuizState {
  books: string[];
  difficulty: 'beginner' | 'advanced';
  answers: Record<string, string | string[]>;
  score: number;
  totalQuestions: number;
  wrongQuestions: Array<{
    question: Question;
    userAnswer: string | string[];
  }>;
}

// Mock questions for result calculation
const mockQuestions: Question[] = [
  {
    id: '1',
    type: 'single',
    question: '哪種食物能幫助修復神經系統？',
    options: ['維生素C', '芹菜汁', '咖啡', '糖'],
    correctAnswer: '芹菜汁',
    source: '《神奇西芹汁》第3章 p.52',
    explanation: '芹菜汁能清除神經系統中重金屬沉積。'
  },
  {
    id: '2',
    type: 'multiple',
    question: '以下哪些是重金屬排毒五大天王？（可複選）',
    options: ['野生藍莓', '香菜', '螺旋藻', '大蒜', '大麥草汁粉'],
    correctAnswer: ['野生藍莓', '香菜', '螺旋藻', '大蒜', '大麥草汁粉'],
    source: '《改變生命的食物》第5章',
    explanation: '這五種食物協同作用，能有效排除體內重金屬。'
  },
  {
    id: '3',
    type: 'fill',
    question: '肝臟最需要的營養素是______。',
    fillOptions: ['葡萄糖', '蛋白質', '脂肪', '纖維'],
    correctAnswer: '葡萄糖',
    source: '《搶救肝臟》第2章',
    explanation: '肝臟需要生物可利用的葡萄糖來執行超過2000種化學功能。'
  },
  {
    id: '4',
    type: 'single',
    question: '以下哪個不是安東尼建議的晨間淨化飲品？',
    options: ['檸檬水', '芹菜汁', '咖啡', '小黃瓜汁'],
    correctAnswer: '咖啡',
    source: '《神奇西芹汁》第1章'
  },
  {
    id: '5',
    type: 'single',
    question: '野生藍莓對大腦的主要療癒作用是？',
    options: ['提供能量', '修復神經元', '增加記憶力', '促進睡眠'],
    correctAnswer: '修復神經元',
    source: '《改變生命的食物》p.78'
  },
  {
    id: '6',
    type: 'fill',
    question: 'EB病毒（Epstein-Barr）的主要食物是______。',
    fillOptions: ['糖分', '蛋', '重金屬', '毒素'],
    correctAnswer: '重金屬',
    source: '《搶救肝臟》第4章'
  },
  {
    id: '7',
    type: 'multiple',
    question: '以下哪些食物是安東尼建議避免的？（可複選）',
    options: ['蛋', '牛奶', '麩質', '玉米', '水果'],
    correctAnswer: ['蛋', '牛奶', '麩質', '玉米'],
    source: '《改變生命的食物》'
  },
  {
    id: '8',
    type: 'single',
    question: '每天應該喝多少毫升的芹菜汁？',
    options: ['250ml', '500ml', '750ml', '1000ml'],
    correctAnswer: '500ml',
    source: '《神奇西芹汁》'
  },
  {
    id: '9',
    type: 'single',
    question: '肝臟排毒最佳的時間是？',
    options: ['早上', '中午', '傍晚', '深夜'],
    correctAnswer: '深夜',
    source: '《搶救肝臟》第3章'
  },
  {
    id: '10',
    type: 'fill',
    question: '香菜能夠幫助身體排出______。',
    fillOptions: ['重金屬', '病毒', '細菌', '寄生蟲'],
    correctAnswer: '重金屬',
    source: '《改變生命的食物》'
  },
  {
    id: '11',
    type: 'single',
    question: '以下哪種水果對肝臟最有益？',
    options: ['蘋果', '香蕉', '木瓜', '櫻桃'],
    correctAnswer: '木瓜',
    source: '《搶救肝臟》'
  },
  {
    id: '12',
    type: 'multiple',
    question: '安東尼推薦的早晨淨化順序是？',
    options: ['檸檬水', '芹菜汁', '重金屬排毒果昔', '早餐'],
    correctAnswer: ['檸檬水', '芹菜汁', '重金屬排毒果昔'],
    source: '《神奇西芹汁》'
  },
  {
    id: '13',
    type: 'single',
    question: '芹菜汁應該如何飲用才能發揮最大功效？',
    options: ['餐後喝', '空腹喝', '加冰塊喝', '加蜂蜜喝'],
    correctAnswer: '空腹喝',
    source: '《神奇西芹汁》第2章'
  },
  {
    id: '14',
    type: 'fill',
    question: '帶狀皰疹是由______病毒引起的。',
    fillOptions: ['EB病毒', '帶狀皰疹病毒', '流感病毒', 'HPV病毒'],
    correctAnswer: '帶狀皰疹病毒',
    source: '《搶救肝臟》'
  },
  {
    id: '15',
    type: 'single',
    question: '以下哪個不是肝臟的主要功能？',
    options: ['排毒', '儲存營養', '製造消化酶', '過濾血液'],
    correctAnswer: '製造消化酶',
    source: '《搶救肝臟》第1章'
  },
  {
    id: '16',
    type: 'multiple',
    question: '靈性高湯的主要食材包括？',
    options: ['洋蔥', '番茄', '芹菜', '大蒜', '香菜'],
    correctAnswer: ['洋蔥', '番茄', '芹菜', '大蒜'],
    source: '《改變生命的食物》'
  },
  {
    id: '17',
    type: 'single',
    question: '鋅對免疫系統的作用是？',
    options: ['增強免疫力', '排毒', '抗發炎', '修復組織'],
    correctAnswer: '增強免疫力',
    source: '《改變生命的食物》'
  },
  {
    id: '18',
    type: 'fill',
    question: '______是最強大的抗病毒食物之一。',
    fillOptions: ['大蒜', '薑', '蜂蜜', '檸檬'],
    correctAnswer: '大蒜',
    source: '《改變生命的食物》'
  },
  {
    id: '19',
    type: 'single',
    question: '369排毒法的天數是？',
    options: ['3天', '6天', '9天', '12天'],
    correctAnswer: '9天',
    source: '《搶救肝臟》'
  },
  {
    id: '20',
    type: 'multiple',
    question: '以下哪些是神經系統的食物？',
    options: ['芹菜汁', '野生藍莓', '菠菜', '香蕉'],
    correctAnswer: ['芹菜汁', '野生藍莓', '菠菜', '香蕉'],
    source: '《神奇西芹汁》'
  }
];

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('landing');
  const [quizState, setQuizState] = useState<QuizState>({
    books: [],
    difficulty: 'beginner',
    answers: {},
    score: 0,
    totalQuestions: 0,
    wrongQuestions: []
  });
  const [adminUser, setAdminUser] = useState<string>('');
  const [leaderboardSource, setLeaderboardSource] = useState<'landing' | 'admin-dashboard'>('landing');

  // Check if user is already logged in on page load
  useEffect(() => {
    const token = getToken();
    const currentUser = getCurrentUser();

    if (token && currentUser) {
      setAdminUser(currentUser.username);
      // Restore the admin page from localStorage if available
      const savedPage = localStorage.getItem('adminCurrentPage');
      if (savedPage && (savedPage === 'admin-dashboard' || savedPage === 'analytics' || savedPage === 'questions')) {
        setCurrentPage(savedPage as AppPage);
      } else {
        setCurrentPage('admin-dashboard');
      }
    }
  }, []);

  const handleStartQuiz = (books: string[], difficulty: 'beginner' | 'advanced') => {
    setQuizState({
      books,
      difficulty,
      answers: {},
      score: 0,
      totalQuestions: mockQuestions.length,
      wrongQuestions: []
    });
    setCurrentPage('quiz');
  };

  const handleQuizComplete = (result: {
    score: number;
    totalQuestions: number;
    wrongQuestions: Array<{ question: Question; userAnswer: string | string[] }>;
    answers: Record<string, string | string[]>;
  }) => {
    setQuizState(prev => ({
      ...prev,
      answers: result.answers,
      score: result.score,
      totalQuestions: result.totalQuestions,
      wrongQuestions: result.wrongQuestions
    }));
    setCurrentPage('result');
  };

  const handleRestartQuiz = () => {
    setCurrentPage('landing');
  };

  const handleAdminLogin = (username: string) => {
    setAdminUser(username);
    setCurrentPage('admin-dashboard');
    // Save the dashboard page to localStorage
    localStorage.setItem('adminCurrentPage', 'admin-dashboard');
  };

  const handleAdminLogout = () => {
    setAdminUser('');
    setCurrentPage('landing');
    // Clear the saved admin page from localStorage
    localStorage.removeItem('adminCurrentPage');
  };

  const handleAdminNavigate = (page: 'analytics' | 'questions' | 'leaderboard') => {
    if (page === 'leaderboard') {
      setLeaderboardSource('admin-dashboard');
    }
    setCurrentPage(page);
    // Save the current admin page to localStorage
    localStorage.setItem('adminCurrentPage', page);
  };

  return (
    <div className="min-h-screen">
      {currentPage === 'landing' && (
        <LandingPage
          onStart={handleStartQuiz}
          onAdminClick={() => setCurrentPage('admin-login')}
          onLeaderboardClick={() => {
            setLeaderboardSource('landing');
            setCurrentPage('leaderboard');
          }}
          onAboutClick={() => setCurrentPage('about')}
        />
      )}

      {currentPage === 'quiz' && (
        <QuizPage
          books={quizState.books}
          difficulty={quizState.difficulty}
          onComplete={handleQuizComplete}
          onBack={() => setCurrentPage('landing')}
        />
      )}

      {currentPage === 'result' && (
        <ResultPage
          score={quizState.score}
          totalQuestions={quizState.totalQuestions}
          wrongQuestions={quizState.wrongQuestions}
          books={quizState.books}
          difficulty={quizState.difficulty}
          userId={localStorage.getItem('quizUserId') || `user_${Date.now()}`}
          onRestart={handleRestartQuiz}
          onHome={() => setCurrentPage('landing')}
        />
      )}

      {currentPage === 'admin-login' && (
        <AdminLogin
          onLogin={handleAdminLogin}
          onBack={() => setCurrentPage('landing')}
        />
      )}

      {currentPage === 'admin-dashboard' && (
        <AdminDashboard
          username={adminUser}
          onNavigate={handleAdminNavigate}
          onLogout={handleAdminLogout}
        />
      )}

      {currentPage === 'analytics' && (
        <Analytics onBack={() => setCurrentPage('admin-dashboard')} />
      )}

      {currentPage === 'questions' && (
        <QuestionBank onBack={() => setCurrentPage('admin-dashboard')} />
      )}

      {currentPage === 'leaderboard' && (
        <Leaderboard onBack={() => setCurrentPage(leaderboardSource)} />
      )}

      {currentPage === 'about' && (
        <About onBack={() => setCurrentPage('landing')} />
      )}
    </div>
  );
}

export default App;
