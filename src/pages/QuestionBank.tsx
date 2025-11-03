import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Checkbox } from "../components/ui/checkbox";
import { NatureAccents } from "../components/NatureAccents";
import { ArrowLeft, Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import {
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../services/questionService";
import { getQuestionsStats, QuestionStats } from "../services/analyticsService";
import { createBook, fetchBooks, type Book } from "../services/bookService";
import { getToken, getCurrentUser } from "../services/authService";
import { BOOKS, DIFFICULTIES } from "../constants/books";

interface QuestionBankProps {
  onBack: () => void;
}

interface ApiQuestion {
  _id: string;
  question: string;
  type: "single" | "multiple" | "fill";
  options?: string[];
  fillOptions?: string[];
  correctAnswer: number | number[];
  book: string;
  difficulty: string;
  source?: string;
  explanation?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

interface QuestionData {
  id: string;
  question: string;
  type: "單選" | "多選" | "填空";
  book: string;
  difficulty: string;
  options?: string[];
  fillOptions?: string[];
  correctAnswer: number | number[];
  source?: string;
  explanation?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

const typeMapping: Record<string, "單選" | "多選" | "填空"> = {
  single: "單選",
  multiple: "多選",
  fill: "填空",
};

const reverseTypeMapping: Record<
  "單選" | "多選" | "填空",
  "single" | "multiple" | "fill"
> = {
  單選: "single",
  多選: "multiple",
  填空: "fill",
};

export function QuestionBank({ onBack }: QuestionBankProps) {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBook, setFilterBook] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterAuthor, setFilterAuthor] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionData | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [stats, setStats] = useState<Map<string, QuestionStats>>(new Map());
  const currentAdmin = getCurrentUser();
  const canDelete = (currentAdmin?.username || '').toLowerCase() === 'chris';

  // 新增書籍相關狀態
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [newBookName, setNewBookName] = useState("");
  const [addingBook, setAddingBook] = useState(false);
  const [booksOptions, setBooksOptions] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    book: "",
    difficulty: "初階",
    type: "單選" as "單選" | "多選" | "填空",
    question: "",
    options: ["", "", "", ""],
    fillOptions: ["", "", "", "", "", ""],
    correctAnswer: [] as number[],
    singleCorrectAnswer: 0,
    explanation: "",
    source: "",
  });

  // Load questions from API
  useEffect(() => {
    loadQuestions();
    (async () => {
      try {
        const books = await fetchBooks();
        setBooksOptions(books.map((b: Book) => b.name));
      } catch (e) {
        console.error("載入書籍清單失敗:", e);
      }
    })();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const apiQuestions = await fetchQuestions({ limit: 1000 });

      // Convert API format to UI format
      const uiQuestions: QuestionData[] = apiQuestions.map(
        (q: ApiQuestion) => ({
          id: q._id,
          question: q.question,
          type: typeMapping[q.type],
          book: q.book,
          difficulty: q.difficulty,
          options: q.options,
          fillOptions: q.fillOptions,
          correctAnswer: q.correctAnswer,
          source: q.source,
          explanation: q.explanation,
          createdBy: q.createdBy,
          createdAt: q.createdAt,
          updatedBy: q.updatedBy,
          updatedAt: q.updatedAt,
        })
      );

      setQuestions(uiQuestions);

      // 載入統計資料
      if (uiQuestions.length > 0) {
        try {
          const questionIds = uiQuestions.map((q) => q.id);
          const statsData = await getQuestionsStats(questionIds);

          // 轉換為 Map 方便查詢
          const statsMap = new Map<string, QuestionStats>();
          statsData.forEach((stat) => {
            statsMap.set(stat.questionId, stat);
          });

          setStats(statsMap);
        } catch (statsError) {
          console.error("載入統計資料失敗:", statsError);
          // 不影響題目顯示，只是沒有統計資料
        }
      }
    } catch (error) {
      console.error("載入題目失敗:", error);
      alert("載入題目失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesBook = filterBook === "all" || q.book === filterBook;
    const matchesDifficulty =
      filterDifficulty === "all" || q.difficulty === filterDifficulty;
    const matchesType = filterType === "all" || q.type === filterType;
    const matchesAuthor =
      filterAuthor === "all" ||
      (q.createdBy || "").toLowerCase() === filterAuthor.toLowerCase();
    return (
      matchesSearch &&
      matchesBook &&
      matchesDifficulty &&
      matchesType &&
      matchesAuthor
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuestions = filteredQuestions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterBook, filterDifficulty, filterType, filterAuthor]);

  const handleDelete = async (id: string) => {
    if (confirm("確定要刪除此題目嗎？")) {
      try {
        await deleteQuestion(id);
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        alert("刪除成功！");
      } catch (error) {
        console.error("刪除失敗:", error);
        alert("刪除失敗，請稍後再試");
      }
    }
  };

  const handleEdit = (question: QuestionData) => {
    setEditingQuestion(question);

    // Populate form data for editing
    let correctAnswerArray: number[] = [];
    let singleAnswer = 0;

    if (question.type === "多選") {
      correctAnswerArray = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [];
    } else {
      singleAnswer =
        typeof question.correctAnswer === "number" ? question.correctAnswer : 0;
    }

    setFormData({
      book: question.book,
      difficulty: question.difficulty,
      type: question.type,
      question: question.question,
      options: question.options || ["", "", "", ""],
      fillOptions: question.fillOptions || ["", "", "", "", "", ""],
      correctAnswer: correctAnswerArray,
      singleCorrectAnswer: singleAnswer,
      explanation: question.explanation || "",
      source: question.source || "",
    });

    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      book: "",
      difficulty: "初階",
      type: "單選",
      question: "",
      options: ["", "", "", ""],
      fillOptions: ["", "", "", "", "", ""],
      correctAnswer: [],
      singleCorrectAnswer: 0,
      explanation: "",
      source: "",
    });
    setEditingQuestion(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate form
      if (!formData.book || !formData.question) {
        alert("請填寫書籍和題目內容");
        return;
      }

      const apiType = reverseTypeMapping[formData.type];
      let apiCorrectAnswer: number | number[];
      let apiOptions: string[] | undefined;
      let apiFillOptions: string[] | undefined;

      if (formData.type === "單選") {
        apiCorrectAnswer = formData.singleCorrectAnswer;
        apiOptions = formData.options.filter((opt) => opt.trim() !== "");
        if (apiOptions.length < 2) {
          alert("單選題至少需要2個選項");
          return;
        }
      } else if (formData.type === "多選") {
        apiCorrectAnswer = formData.correctAnswer;
        apiOptions = formData.options.filter((opt) => opt.trim() !== "");
        if (apiOptions.length < 2) {
          alert("多選題至少需要2個選項");
          return;
        }
        if (formData.correctAnswer.length === 0) {
          alert("請至少選擇一個正確答案");
          return;
        }
      } else {
        // Fill type
        apiCorrectAnswer = formData.singleCorrectAnswer;
        apiFillOptions = formData.fillOptions.filter(
          (opt) => opt.trim() !== ""
        );
        if (apiFillOptions.length < 2) {
          alert("填空題至少需要2個選項");
          return;
        }
      }

      const questionData = {
        type: apiType,
        question: formData.question,
        options: apiOptions,
        fillOptions: apiFillOptions,
        correctAnswer: apiCorrectAnswer,
        difficulty: formData.difficulty,
        book: formData.book,
        source: formData.source || undefined,
        explanation: formData.explanation || undefined,
      };

      if (editingQuestion) {
        // Update existing question
        await updateQuestion(editingQuestion.id, questionData);
        alert("更新成功！");
      } else {
        // Create new question
        await createQuestion(questionData);
        alert("新增成功！");
      }

      // Reload questions
      await loadQuestions();

      // Close dialog and reset form
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("儲存失敗:", error);
      alert("儲存失敗，請稍後再試");
    } finally {
      setSaving(false);
    }
  };

  // 處理新增書籍
  const handleAddBook = async () => {
    try {
      // 驗證書籍名稱
      if (!newBookName || newBookName.trim().length === 0) {
        alert("請輸入書籍名稱");
        return;
      }

      setAddingBook(true);

      // 取得管理員 token
      const token = getToken();
      if (!token) {
        alert("請先登入");
        return;
      }

      // 移除書名號（如果有的話）
      let bookName = newBookName.trim();
      bookName = bookName.replace(/[《》]/g, "");

      if (bookName.length === 0) {
        alert("書籍名稱不能只包含書名號");
        setAddingBook(false);
        return;
      }

      // 呼叫 API 新增書籍
      await createBook(bookName, token);

      alert(`書籍「${bookName}」新增成功！`);

      // 關閉對話框並清空輸入
      setIsBookDialogOpen(false);
      setNewBookName("");

      // 可選：重新載入題目以更新書籍列表（如果需要的話）
      // await loadQuestions();
    } catch (error: any) {
      console.error("新增書籍失敗:", error);
      alert(error.message || "新增書籍失敗，請稍後再試");
    } finally {
      setAddingBook(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF7] to-[#F7E6C3]/20 relative overflow-hidden">
      {/* Nature Accents */}
      <NatureAccents variant="minimal" />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-[#A8CBB7]/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                className="text-[#A8CBB7] hover:bg-[#F7E6C3]/20"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回
              </Button>
              <h2 className="text-[#2d3436]">題庫管理</h2>
            </div>

            <div className="flex gap-2">
              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    新增題目
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingQuestion ? "編輯題目" : "新增題目"}
                    </DialogTitle>
                    <DialogDescription>
                      填寫題目相關資訊，完成後點擊儲存
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>書籍 *</Label>
                        <Select
                          value={formData.book}
                          onValueChange={(v) =>
                            setFormData({ ...formData, book: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="選擇書籍" />
                          </SelectTrigger>
                          <SelectContent>
                            {BOOKS.map((book) => (
                              <SelectItem key={book.db} value={book.db}>
                                {book.display}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>難度 *</Label>
                        <RadioGroup
                          value={formData.difficulty}
                          onValueChange={(v) =>
                            setFormData({ ...formData, difficulty: v })
                          }
                        >
                          {DIFFICULTIES.map((diff) => (
                            <div
                              key={diff.db}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem value={diff.db} id={diff.key} />
                              <Label htmlFor={diff.key}>{diff.display}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>題型 *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(v) =>
                          setFormData({
                            ...formData,
                            type: v as "單選" | "多選" | "填空",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="單選">單選題</SelectItem>
                          <SelectItem value="多選">多選題</SelectItem>
                          <SelectItem value="填空">填空題</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>題目內容 *</Label>
                      <Textarea
                        placeholder="輸入題目..."
                        value={formData.question}
                        onChange={(e) =>
                          setFormData({ ...formData, question: e.target.value })
                        }
                        rows={3}
                      />
                    </div>

                    {(formData.type === "單選" || formData.type === "多選") && (
                      <div className="space-y-2">
                        <Label>選項 *</Label>
                        {formData.options.map((opt, idx) => (
                          <Input
                            key={idx}
                            placeholder={`選項 ${idx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...formData.options];
                              newOptions[idx] = e.target.value;
                              setFormData({ ...formData, options: newOptions });
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {formData.type === "填空" && (
                      <div className="space-y-2">
                        <Label>填空選項 *</Label>
                        {formData.fillOptions.map((opt, idx) => (
                          <Input
                            key={idx}
                            placeholder={`選項 ${idx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const newFillOptions = [...formData.fillOptions];
                              newFillOptions[idx] = e.target.value;
                              setFormData({
                                ...formData,
                                fillOptions: newFillOptions,
                              });
                            }}
                          />
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>正確答案 *</Label>
                      {formData.type === "單選" && (
                        <RadioGroup
                          value={String(formData.singleCorrectAnswer)}
                          onValueChange={(v) =>
                            setFormData({
                              ...formData,
                              singleCorrectAnswer: parseInt(v),
                            })
                          }
                        >
                          {formData.options.map(
                            (opt, idx) =>
                              opt.trim() && (
                                <div
                                  key={idx}
                                  className="flex items-center space-x-2"
                                >
                                  <RadioGroupItem
                                    value={String(idx)}
                                    id={`answer-${idx}`}
                                  />
                                  <Label htmlFor={`answer-${idx}`}>
                                    {opt || `選項 ${idx + 1}`}
                                  </Label>
                                </div>
                              )
                          )}
                        </RadioGroup>
                      )}
                      {formData.type === "多選" && (
                        <div className="space-y-2">
                          {formData.options.map(
                            (opt, idx) =>
                              opt.trim() && (
                                <div
                                  key={idx}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`answer-${idx}`}
                                    checked={formData.correctAnswer.includes(
                                      idx
                                    )}
                                    onCheckedChange={(checked) => {
                                      const newAnswers = checked
                                        ? [...formData.correctAnswer, idx]
                                        : formData.correctAnswer.filter(
                                            (a) => a !== idx
                                          );
                                      setFormData({
                                        ...formData,
                                        correctAnswer: newAnswers,
                                      });
                                    }}
                                  />
                                  <Label htmlFor={`answer-${idx}`}>
                                    {opt || `選項 ${idx + 1}`}
                                  </Label>
                                </div>
                              )
                          )}
                        </div>
                      )}
                      {formData.type === "填空" && (
                        <RadioGroup
                          value={String(formData.singleCorrectAnswer)}
                          onValueChange={(v) =>
                            setFormData({
                              ...formData,
                              singleCorrectAnswer: parseInt(v),
                            })
                          }
                        >
                          {formData.fillOptions.map(
                            (opt, idx) =>
                              opt.trim() && (
                                <div
                                  key={idx}
                                  className="flex items-center space-x-2"
                                >
                                  <RadioGroupItem
                                    value={String(idx)}
                                    id={`answer-${idx}`}
                                  />
                                  <Label htmlFor={`answer-${idx}`}>
                                    {opt || `選項 ${idx + 1}`}
                                  </Label>
                                </div>
                              )
                          )}
                        </RadioGroup>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>解析</Label>
                      <Textarea
                        placeholder="解釋為什麼這是正確答案..."
                        value={formData.explanation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            explanation: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>來源</Label>
                      <Input
                        placeholder="例如：《搶救肝臟》第3章"
                        value={formData.source}
                        onChange={(e) =>
                          setFormData({ ...formData, source: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          resetForm();
                        }}
                        className="border-[#A8CBB7]"
                        disabled={saving}
                      >
                        取消
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8] text-white"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            儲存中...
                          </>
                        ) : (
                          "儲存"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* 新增書籍 Dialog */}
              <Dialog
                open={isBookDialogOpen}
                onOpenChange={(open) => {
                  setIsBookDialogOpen(open);
                  if (!open) setNewBookName("");
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    新增書籍
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>新增書籍</DialogTitle>
                    <DialogDescription>輸入新書籍的名稱</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="bookName">書籍名稱 *</Label>
                      <Input
                        id="bookName"
                        placeholder="例如：神奇西芹汁"
                        value={newBookName}
                        onChange={(e) => setNewBookName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !addingBook) {
                            handleAddBook();
                          }
                        }}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsBookDialogOpen(false);
                          setNewBookName("");
                        }}
                        disabled={addingBook}
                      >
                        取消
                      </Button>
                      <Button
                        onClick={handleAddBook}
                        disabled={addingBook || !newBookName.trim()}
                        className="bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8] text-white"
                      >
                        {addingBook ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            新增中...
                          </>
                        ) : (
                          "新增"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-[#A8CBB7]/20">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">題目列表</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#636e72]" />
                  <Input
                    placeholder="搜尋題目..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterBook} onValueChange={setFilterBook}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="選擇書籍" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部書籍</SelectItem>
                    <SelectItem value="神奇西芹汁">神奇西芹汁</SelectItem>
                    <SelectItem value="搶救肝臟">搶救肝臟</SelectItem>
                    <SelectItem value="改變生命的食物">
                      改變生命的食物
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filterDifficulty}
                  onValueChange={setFilterDifficulty}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="難度" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部難度</SelectItem>
                    <SelectItem value="初階">初階</SelectItem>
                    <SelectItem value="進階">進階</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="題型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部題型</SelectItem>
                    <SelectItem value="單選">單選題</SelectItem>
                    <SelectItem value="多選">多選題</SelectItem>
                    <SelectItem value="填空">填空題</SelectItem>
                  </SelectContent>
                </Select>

                {/* 出題者篩選 */}
                <Select value={filterAuthor} onValueChange={setFilterAuthor}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="出題者" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部出題者</SelectItem>
                    <SelectItem value="Bebe">Bebe</SelectItem>
                    <SelectItem value="Miruki">Miruki</SelectItem>
                    <SelectItem value="Chris">Chris</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#A8CBB7]" />
                  <span className="ml-3 text-[#636e72]">載入中...</span>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-[#A8CBB7]/20 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#F7E6C3]/20 border-[#A8CBB7]/20">
                          <TableHead className="w-20">題號</TableHead>
                          <TableHead className="w-96">題目內容</TableHead>
                          <TableHead className="w-24">題型</TableHead>
                          <TableHead className="w-32">書籍</TableHead>
                          <TableHead className="w-20">難度</TableHead>
                          <TableHead className="w-28">正確率</TableHead>
                          <TableHead className="w-24">出題</TableHead>
                          <TableHead className="w-32 text-right">
                            操作
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentQuestions.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-8 text-[#636e72]"
                            >
                              沒有找到題目
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentQuestions.map((q, index) => (
                            <TableRow
                              key={q.id}
                              className="border-[#A8CBB7]/20"
                            >
                              <TableCell className="font-mono text-sm">
                                #{startIndex + index + 1}
                              </TableCell>
                              <TableCell className="max-w-96">
                                <div
                                  className="truncate overflow-hidden text-ellipsis whitespace-nowrap"
                                  title={q.question}
                                  style={{ maxWidth: "24rem" }}
                                >
                                  {q.question}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="px-2 py-1 bg-[#A8CBB7]/20 rounded text-sm">
                                  {q.type}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="px-2 py-1 bg-[#F7E6C3]/50 rounded text-sm">
                                  {q.book}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`
                                  px-2 py-1 rounded text-sm
                                  ${
                                    q.difficulty === "初階"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-orange-100 text-orange-700"
                                  }
                                `}
                                >
                                  {q.difficulty}
                                </span>
                              </TableCell>
                              <TableCell>
                                {(() => {
                                  const stat = stats.get(q.id);
                                  if (!stat || stat.totalAnswers === 0) {
                                    return (
                                      <span className="text-[#636e72] text-sm">
                                        尚無統計資料
                                      </span>
                                    );
                                  }
                                  return (
                                    <div className="flex flex-col gap-1">
                                      <span
                                        className={`
                                        font-semibold
                                        ${
                                          stat.correctRate >= 80
                                            ? "text-green-600"
                                            : stat.correctRate >= 60
                                            ? "text-blue-600"
                                            : stat.correctRate >= 40
                                            ? "text-orange-600"
                                            : "text-red-600"
                                        }
                                      `}
                                      >
                                        {stat.correctRate}%
                                      </span>
                                      <span className="text-xs text-[#636e72]">
                                        ({stat.correctAnswers}/
                                        {stat.totalAnswers})
                                      </span>
                                    </div>
                                  );
                                })()}
                              </TableCell>
                              <TableCell>
                                {q.createdBy || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEdit(q)}
                                      className="text-[#A8CBB7] hover:bg-[#F7E6C3]/20"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    {canDelete && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(q.id)}
                                        className="text-red-500 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-[#636e72]">
                      共 {filteredQuestions.length} 筆題目，顯示第{" "}
                      {startIndex + 1} -{" "}
                      {Math.min(endIndex, filteredQuestions.length)} 筆
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={currentPage === 1}
                          className="border-[#A8CBB7] text-[#A8CBB7] hover:bg-[#A8CBB7] hover:text-white disabled:opacity-50"
                        >
                          上一頁
                        </Button>

                        <span className="text-sm text-[#636e72] px-3">
                          第 {currentPage} / {totalPages} 頁
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="border-[#A8CBB7] text-[#A8CBB7] hover:bg-[#A8CBB7] hover:text-white disabled:opacity-50"
                        >
                          下一頁
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}



