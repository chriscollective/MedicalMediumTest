import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QuestionCard, Question } from '../components/QuestionCard';
import { QuizProgress } from '../components/QuizProgress';
import { Button } from '../components/ui/button';
import { NatureAccents } from '../components/NatureAccents';
import { ChevronLeft, ChevronRight, Home, Pause, Sparkles } from 'lucide-react';
import { fetchQuizQuestions, fetchMixedQuizQuestions } from '../services/questionService';
import { createQuiz, submitQuiz } from '../services/quizService';
import { getUserId } from '../utils/userStorage';
import { Question as ApiQuestion } from '../types/question';
import { getBookByDisplay, getDifficultyByKey } from '../constants/books';

interface QuizResult {
  score: number;
  totalQuestions: number;
  wrongQuestions: Array<{
    question: Question;
    userAnswer: string | string[];
  }>;
  answers: Record<string, string | string[]>;
}

interface QuizPageProps {
  books: string[];
  difficulty: string;
  onComplete: (result: QuizResult) => void;
  onBack: () => void;
}

// Mock questions - 20 questions total (4 pages x 5 questions)
const generateMockQuestions = (): Question[] => {
  return [
    // Page 1
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
    // Page 2
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
    // Page 3
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
    // Page 4
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
};

export function QuizPage({ books, difficulty, onComplete, onBack }: QuizPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 載入題目
  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);

        // 使用映射轉換難度（beginner/advanced -> 初階/進階）
        const apiDifficulty = getDifficultyByKey(difficulty);

        let apiQuestions: ApiQuestion[];

        // 如果選擇多本書，使用混合抽題
        if (books.length > 1) {
          // 轉換所有書籍名稱
          const dbBooks = books.map(bookDisplay => getBookByDisplay(bookDisplay));
          console.log('📚 準備載入多本書混合題目:', { books: dbBooks, difficulty: apiDifficulty });

          apiQuestions = await fetchMixedQuizQuestions(dbBooks, apiDifficulty);
        } else {
          // 單本書，使用原本的邏輯
          const bookDisplay = books[0] || '《神奇西芹汁》';
          const book = getBookByDisplay(bookDisplay);
          console.log('📚 準備載入單本書題目:', { book, difficulty: apiDifficulty });

          apiQuestions = await fetchQuizQuestions(book, apiDifficulty);
        }

        if (apiQuestions.length !== 20) {
          throw new Error(`題庫不足，僅取得 ${apiQuestions.length} 題，需要 20 題`);
        }

        // 轉換 API 格式為 UI 格式
        const uiQuestions: Question[] = apiQuestions.map((q: ApiQuestion) => {
          // 將數字索引轉換為實際的字串答案
          let correctAnswerStr: string | string[];

          if (q.type === 'single') {
            // 單選：從 options 取得對應索引的字串
            correctAnswerStr = q.options?.[q.correctAnswer as number] || '';
          } else if (q.type === 'multiple') {
            // 多選：從 options 取得所有索引對應的字串
            const indices = q.correctAnswer as number[];
            correctAnswerStr = indices.map(idx => q.options?.[idx] || '').filter(Boolean);
          } else {
            // 填空：從 fillOptions 取得對應索引的字串
            correctAnswerStr = q.fillOptions?.[q.correctAnswer as number] || '';
          }

          return {
            id: q._id,
            type: q.type,
            question: q.question,
            options: q.options,
            fillOptions: q.fillOptions,
            correctAnswer: correctAnswerStr,
            source: q.source,
            explanation: q.explanation
          };
        });

        setQuestions(uiQuestions);
        setError(null);

        // 建立測驗記錄
        try {
          const userId = getUserId();
          // 對於多本書，使用第一本書作為主要書籍記錄（或可以改成「混合」）
          const primaryBook = books.length > 1
            ? getBookByDisplay(books[0])
            : getBookByDisplay(books[0] || '《神奇西芹汁》');

          console.log('準備建立測驗記錄:', { userId, book: primaryBook, difficulty: apiDifficulty, questionCount: apiQuestions.length });

          const quiz = await createQuiz({
            userId,
            book: primaryBook,
            difficulty: apiDifficulty,
            questionIds: apiQuestions.map(q => q._id)
          });
          setQuizId(quiz._id);
          console.log('✅ 測驗記錄已建立:', quiz._id);
        } catch (quizErr: any) {
          console.error('❌ 建立測驗記錄失敗:', quizErr);
          console.error('錯誤詳情:', quizErr.response?.data || quizErr.message);
          // 不影響繼續作答，只是無法記錄
        }
      } catch (err: any) {
        console.error('載入題目失敗:', err);
        setError(err.message || '載入題目失敗，請稍後再試');
        // 使用 Mock 資料作為備案
        setQuestions(generateMockQuestions());
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [books, difficulty]);

  const questionsPerPage = 5;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  
  const currentQuestions = questions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );
  
  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleNext = async () => {
    if (currentPage < totalPages) {
      setDirection('forward');
      setCurrentPage(prev => prev + 1);
      // 滾動到頁面頂部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // 在最後一頁點擊完成時，檢查是否所有題目都已作答
      const unansweredQuestions: number[] = [];

      questions.forEach((question, index) => {
        const answer = answers[question.id];

        // 檢查答案是否存在且有效
        const isAnswered = answer !== undefined &&
                          answer !== null &&
                          (Array.isArray(answer) ? answer.length > 0 : answer !== '');

        if (!isAnswered) {
          unansweredQuestions.push(index + 1); // 題號從 1 開始
        }
      });

      // 如果有未作答的題目，顯示警告
      if (unansweredQuestions.length > 0) {
        const questionNumbers = unansweredQuestions.join('、');
        alert(`第 ${questionNumbers} 題尚未作答，請完成答題後再交卷！`);
        return;
      }

      // 所有題目都已作答，提交測驗
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!quizId) {
      console.error('無測驗 ID，無法提交');
      onComplete(answers);
      return;
    }

    try {
      setSubmitting(true);

      // 轉換答案格式：從 string/string[] 轉為 index number/number[]
      const submissionAnswers = questions.map(question => {
        const userAnswer = answers[question.id];
        let convertedAnswer: number | number[] | null = null;

        if (userAnswer !== undefined && userAnswer !== null) {
          if (question.type === 'single') {
            // 單選：找到選項的 index
            const index = question.options?.indexOf(userAnswer as string) ?? -1;
            convertedAnswer = index >= 0 ? index : null;
          } else if (question.type === 'multiple') {
            // 多選：找到所有選項的 indices
            const selectedOptions = userAnswer as string[];
            convertedAnswer = selectedOptions
              .map(opt => question.options?.indexOf(opt) ?? -1)
              .filter(idx => idx >= 0);
          } else if (question.type === 'fill') {
            // 填空：找到填空選項的 index
            const index = question.fillOptions?.indexOf(userAnswer as string) ?? -1;
            convertedAnswer = index >= 0 ? index : null;
          }
        }

        return {
          questionId: question.id,
          userAnswer: convertedAnswer
        };
      });

      // 提交到 API
      const result = await submitQuiz(quizId, {
        answers: submissionAnswers
      });

      console.log('測驗提交成功:', result);

      // 將 API 回傳的 answerBitmap 轉換為錯題列表
      const wrongQuestions: Array<{ question: Question; userAnswer: string | string[] }> = [];

      // answerBitmap 是 20 個字元的字串，'1' 代表正確，'0' 代表錯誤
      if (result.answerBitmap) {
        result.answerBitmap.split('').forEach((bit, index) => {
          if (bit === '0') {
            // 這題答錯了
            const question = questions[index];
            if (question) {
              const userAnswer = answers[question.id];
              wrongQuestions.push({ question, userAnswer });
            }
          }
        });
      }

      // 傳遞完整結果給 onComplete
      onComplete({
        score: result.correctCount,
        totalQuestions: result.totalQuestions,
        wrongQuestions,
        answers
      });
    } catch (err) {
      console.error('提交測驗失敗:', err);
      // 提交失敗時，使用本地計算的結果
      const wrongQuestions: Array<{ question: Question; userAnswer: string | string[] }> = [];
      let score = 0;

      questions.forEach(question => {
        const userAnswer = answers[question.id];
        const correctAnswer = question.correctAnswer;

        let isCorrect = false;
        if (question.type === 'multiple') {
          const userArr = (userAnswer as string[]) || [];
          const correctArr = correctAnswer as string[];
          isCorrect = userArr.length === correctArr.length && userArr.every(a => correctArr.includes(a));
        } else {
          isCorrect = userAnswer === correctAnswer;
        }

        if (isCorrect) {
          score++;
        } else {
          wrongQuestions.push({ question, userAnswer });
        }
      });

      onComplete({
        score,
        totalQuestions: questions.length,
        wrongQuestions,
        answers
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handlePrevious = () => {
    if (currentPage > 1) {
      setDirection('backward');
      setCurrentPage(prev => prev - 1);
      // 滾動到頁面頂部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Loading 狀態
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAFAF7] to-[#F7E6C3]/30 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-[#A8CBB7] animate-pulse mx-auto mb-4" />
          <p className="text-[#636e72] text-lg">正在載入題目...</p>
        </div>
      </div>
    );
  }

  // Error 狀態（顯示警告但繼續使用 Mock 資料）
  const showErrorBanner = error && questions.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF7] to-[#F7E6C3]/30 relative overflow-hidden">
      {/* Nature Accents */}
      <NatureAccents variant="minimal" />

      {/* Error Banner */}
      {showErrorBanner && (
        <div className="sticky top-0 z-50 bg-yellow-100 border-b border-yellow-300 px-4 py-2">
          <p className="text-yellow-800 text-sm text-center">
            ⚠️ {error} - 目前使用範例題目
          </p>
        </div>
      )}
      
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm border-b border-[#A8CBB7]/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#A8CBB7]" />
              <span className="text-[#2d3436]">醫療靈媒測驗</span>
            </div>
            
            <div className="flex-1 max-w-md mx-8">
              <QuizProgress currentPage={currentPage} totalPages={totalPages} />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#636e72] hover:text-[#A8CBB7] hover:bg-[#F7E6C3]/20"
              >
                <Pause className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-[#636e72] hover:text-[#A8CBB7] hover:bg-[#F7E6C3]/20"
              >
                <Home className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Questions */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            initial={{ opacity: 0, x: direction === 'forward' ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === 'forward' ? -100 : 100 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 max-w-3xl mx-auto"
          >
            {currentQuestions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <QuestionCard
                  question={question}
                  index={(currentPage - 1) * questionsPerPage + index}
                  userAnswer={answers[question.id]}
                  onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Buttons */}
        <div className="fixed bottom-8 right-8 flex gap-3">
          <Button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            variant="outline"
            className="
              rounded-full w-12 h-12 p-0
              border-[#A8CBB7] text-[#A8CBB7]
              hover:bg-[#A8CBB7] hover:text-white
              disabled:opacity-30 disabled:cursor-not-allowed
              shadow-lg hover:shadow-xl
              transition-all duration-300
            "
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={submitting}
            className="
              rounded-full px-6 h-12
              bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8]
              text-white shadow-lg hover:shadow-xl
              transition-all duration-300
              flex items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {submitting ? '提交中...' : currentPage === totalPages ? '完成' : '下一頁'}
            {!submitting && <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>
        
        {/* Page Indicator */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
            <span className="text-sm text-[#636e72]">
              第 {currentPage} / {totalPages} 頁
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
