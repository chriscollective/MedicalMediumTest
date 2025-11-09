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
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Minus,
} from "lucide-react";
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
  type: "single" | "multiple" | "cloze";
  options?: string[];
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

type QuestionTypeLabel = "單選" | "多選" | "克漏字";

interface QuestionData {
  id: string;
  question: string;
  type: QuestionTypeLabel;
  book: string;
  difficulty: string;
  options?: string[];
  correctAnswer: number | number[];
  source?: string;
  explanation?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

const typeMapping: Record<ApiQuestion["type"], QuestionTypeLabel> = {
  single: "單選",
  multiple: "多選",
  cloze: "克漏字",
};

const reverseTypeMapping: Record<QuestionTypeLabel, ApiQuestion["type"]> = {
  單選: "single",
  多選: "multiple",
  克漏字: "cloze",
};

const MIN_CLOZE_OPTIONS = 1;
const MAX_CLOZE_OPTIONS = 6;
const DEFAULT_CLOZE_OPTION_COUNT = 3;

const createClozeOptions = (length: number) => Array.from({ length }, () => "");

const createClozeOrder = (length: number) =>
  Array.from({ length }, (_, idx) => idx);

const sanitizeClozeOrder = (optionsLength: number, currentOrder: number[]) => {
  if (optionsLength <= 0) {
    return [];
  }

  const result: number[] = [];
  const seen = new Set<number>();

  currentOrder.forEach((idx) => {
    if (
      Number.isInteger(idx) &&
      idx >= 0 &&
      idx < optionsLength &&
      !seen.has(idx)
    ) {
      seen.add(idx);
      result.push(idx);
    }
  });

  return result;
};

const ensureClozeOrderLength = (
  optionsLength: number,
  currentOrder: number[]
) => {
  if (optionsLength <= 0) {
    return [];
  }
  const sanitized = sanitizeClozeOrder(optionsLength, currentOrder);
  if (sanitized.length > 0) {
    return sanitized;
  }
  // fallback：若使用者尚未設定任何答案，預設第一個選項
  return [0];
};

export function QuestionBank({ onBack }: QuestionBankProps) {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBook, setFilterBook] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterAuthor, setFilterAuthor] = useState<string>("all");
  const [sortByAccuracy, setSortByAccuracy] = useState<string>("none"); // none | asc | desc
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionData | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [stats, setStats] = useState<Map<string, QuestionStats>>(new Map());
  const currentAdmin = getCurrentUser();
  const canDelete = (currentAdmin?.username || "").toLowerCase() === "chris";

  // 新增書籍相關狀態
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [newBookName, setNewBookName] = useState("");
  const [addingBook, setAddingBook] = useState(false);
  const [booksOptions, setBooksOptions] = useState<string[]>([]);

  const DEFAULT_SINGLE_OPTIONS = ["", "", "", ""];
  const [formData, setFormData] = useState({
    book: "",
    difficulty: "初階",
    type: "單選" as QuestionTypeLabel,
    question: "",
    options: [...DEFAULT_SINGLE_OPTIONS],
    clozeOptions: createClozeOptions(DEFAULT_CLOZE_OPTION_COUNT),
    correctAnswer: [] as number[], // 多選使用
    clozeOrder: createClozeOrder(DEFAULT_CLOZE_OPTION_COUNT),
    singleCorrectAnswer: 0,
    explanation: "",
    source: "",
  });

  // Load questions from API
  useEffect(() => {
    loadQuestions();
    (async () => {
      try {
        const bookStart = performance.now();
        const books = await fetchBooks();
        setBooksOptions(books.map((b: Book) => b.name));
        console.log(
          "[QuestionBank] 書籍列表載入完成",
          `耗時 ${(performance.now() - bookStart).toFixed(0)} ms`
        );
      } catch (e) {
        console.error("載入書籍清單失敗:", e);
      }
    })();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const startTime = performance.now();
      console.log("[QuestionBank] 開始載入題庫資料", new Date().toISOString());

      const apiQuestions = await fetchQuestions({ limit: 1000 });

      // Convert API format to UI format
      const uiQuestions: QuestionData[] = apiQuestions.map(
        (q: ApiQuestion) => ({
          id: q._id,
          question: q.question,
          type: typeMapping[q.type] ?? "單選",
          book: q.book,
          difficulty: q.difficulty,
          options: q.options,
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
          console.log(
            "[QuestionBank] 題目統計載入完成",
            `耗時 ${(performance.now() - startTime).toFixed(0)} ms`
          );
        } catch (statsError) {
          console.error("載入統計資料失敗:", statsError);
          // 不影響題目顯示，只是沒有統計資料
        }
      }

      console.log(
        "[QuestionBank] 題庫資料載入完成",
        new Date().toISOString(),
        `耗時 ${(performance.now() - startTime).toFixed(0)} ms`
      );
    } catch (error) {
      console.error("載入題目失敗:", error);
      alert("載入題目失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions
    .filter((q) => {
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
    })
    .sort((a, b) => {
      if (sortByAccuracy === "none") return 0;

      const statA = stats.get(a.id);
      const statB = stats.get(b.id);

      // 處理沒有統計資料的情況：將它們排在最後
      const rateA = statA && statA.totalAnswers > 0 ? statA.correctRate : -1;
      const rateB = statB && statB.totalAnswers > 0 ? statB.correctRate : -1;

      if (rateA === -1 && rateB === -1) return 0;
      if (rateA === -1) return 1; // A 沒有資料，排後面
      if (rateB === -1) return -1; // B 沒有資料，排後面

      if (sortByAccuracy === "asc") {
        return rateA - rateB; // 低到高
      } else {
        return rateB - rateA; // 高到低
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuestions = filteredQuestions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    filterBook,
    filterDifficulty,
    filterType,
    filterAuthor,
    sortByAccuracy,
  ]);

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

    let correctAnswerArray: number[] = [];
    let singleAnswer = 0;
    let clozeOptions =
      question.type === "克漏字" &&
      question.options &&
      question.options.length > 0
        ? [...question.options]
            .slice(0, MAX_CLOZE_OPTIONS)
            .map((opt) => String(opt ?? "").trim())
        : createClozeOptions(DEFAULT_CLOZE_OPTION_COUNT);
    if (clozeOptions.length < MIN_CLOZE_OPTIONS) {
      clozeOptions = createClozeOptions(DEFAULT_CLOZE_OPTION_COUNT);
    }
    let clozeOrder = ensureClozeOrderLength(
      clozeOptions.length,
      Array.isArray(question.correctAnswer)
        ? (question.correctAnswer as number[])
        : []
    );

    if (question.type === "多選") {
      correctAnswerArray = Array.isArray(question.correctAnswer)
        ? (question.correctAnswer as number[])
        : [];
    } else if (question.type !== "克漏字") {
      singleAnswer =
        typeof question.correctAnswer === "number"
          ? (question.correctAnswer as number)
          : 0;
    }

    setFormData({
      book: question.book,
      difficulty: question.difficulty,
      type: question.type,
      question: question.question,
      options:
        question.options && question.options.length > 0
          ? [...question.options]
          : [...DEFAULT_SINGLE_OPTIONS],
      clozeOptions,
      correctAnswer: question.type === "多選" ? correctAnswerArray : [],
      clozeOrder,
      singleCorrectAnswer: question.type === "單選" ? singleAnswer : 0,
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
      options: [...DEFAULT_SINGLE_OPTIONS],
      clozeOptions: createClozeOptions(DEFAULT_CLOZE_OPTION_COUNT),
      correctAnswer: [],
      clozeOrder: createClozeOrder(DEFAULT_CLOZE_OPTION_COUNT),
      singleCorrectAnswer: 0,
      explanation: "",
      source: "",
    });
    setEditingQuestion(null);
  };

  const handleClozeOrderChange = (position: number, value: number) => {
    setFormData((prev) => {
      if (
        value < 0 ||
        value >= prev.clozeOptions.length ||
        position < 0 ||
        position >= prev.clozeOrder.length
      ) {
        return prev;
      }
      const updatedOrder = [...prev.clozeOrder];
      const existingIndex = updatedOrder.indexOf(value);

      if (existingIndex !== -1 && existingIndex !== position) {
        updatedOrder[existingIndex] = updatedOrder[position];
      }

      updatedOrder[position] = value;

      return {
        ...prev,
        clozeOrder: ensureClozeOrderLength(
          prev.clozeOptions.length,
          updatedOrder
        ),
      };
    });
  };

  const handleClozeOptionChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newOptions = [...prev.clozeOptions];
      newOptions[index] = value;
      return {
        ...prev,
        clozeOptions: newOptions,
        clozeOrder: ensureClozeOrderLength(newOptions.length, prev.clozeOrder),
      };
    });
  };

  const handleAddClozeOption = () => {
    setFormData((prev) => {
      if (prev.clozeOptions.length >= MAX_CLOZE_OPTIONS) {
        return prev;
      }
      const newOptions = [...prev.clozeOptions, ""];
      return {
        ...prev,
        clozeOptions: newOptions,
        clozeOrder: ensureClozeOrderLength(newOptions.length, prev.clozeOrder),
      };
    });
  };

  const handleRemoveClozeOption = (index: number) => {
    setFormData((prev) => {
      if (prev.clozeOptions.length <= MIN_CLOZE_OPTIONS) {
        return prev;
      }
      const newOptions = prev.clozeOptions.filter((_, idx) => idx !== index);
      const remappedOrder = prev.clozeOrder
        .filter((idx) => idx !== index)
        .map((idx) => (idx > index ? idx - 1 : idx));
      return {
        ...prev,
        clozeOptions: newOptions,
        clozeOrder: ensureClozeOrderLength(newOptions.length, remappedOrder),
      };
    });
  };

  const handleAddClozeBlank = () => {
    setFormData((prev) => {
      if (prev.clozeOrder.length >= prev.clozeOptions.length) {
        return prev;
      }
      const available = prev.clozeOptions
        .map((_, idx) => idx)
        .filter((idx) => !prev.clozeOrder.includes(idx));
      const nextIndex = available.length > 0 ? available[0] : 0;
      return {
        ...prev,
        clozeOrder: [...prev.clozeOrder, nextIndex],
      };
    });
  };

  const handleRemoveClozeBlank = (index: number) => {
    setFormData((prev) => {
      if (prev.clozeOrder.length <= 1) {
        return prev;
      }
      const newOrder = prev.clozeOrder.filter((_, idx) => idx !== index);
      return {
        ...prev,
        clozeOrder: ensureClozeOrderLength(prev.clozeOptions.length, newOrder),
      };
    });
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

      const normalizeOptions = (options: string[]) =>
        options
          .map((opt, idx) => ({
            value: opt.trim(),
            originalIndex: idx,
          }))
          .filter((entry) => entry.value.length > 0);

      if (formData.type === "單選") {
        const optionEntries = normalizeOptions(formData.options);
        if (optionEntries.length < 2) {
          alert("單選題至少需要 2 個選項");
          return;
        }
        const selectedIndex = optionEntries.findIndex(
          (entry) => entry.originalIndex === formData.singleCorrectAnswer
        );
        if (selectedIndex === -1) {
          alert("請選擇有效的正確答案");
          return;
        }
        apiOptions = optionEntries.map((entry) => entry.value);
        apiCorrectAnswer = selectedIndex;
      } else if (formData.type === "多選") {
        const optionEntries = normalizeOptions(formData.options);
        if (optionEntries.length < 2) {
          alert("多選題至少需要 2 個選項");
          return;
        }
        if (formData.correctAnswer.length === 0) {
          alert("請至少選擇一個正確答案");
          return;
        }
        const mappedAnswers = formData.correctAnswer.map((answerIdx) =>
          optionEntries.findIndex((entry) => entry.originalIndex === answerIdx)
        );
        if (mappedAnswers.some((idx) => idx === -1)) {
          alert("請確認勾選的選項皆有填寫內容");
          return;
        }
        apiOptions = optionEntries.map((entry) => entry.value);
        apiCorrectAnswer = [...mappedAnswers].sort((a, b) => a - b);
      } else {
        // 克漏字
        const clozeOptions = formData.clozeOptions.map((opt) => opt.trim());
        if (
          clozeOptions.length < MIN_CLOZE_OPTIONS ||
          clozeOptions.length > MAX_CLOZE_OPTIONS
        ) {
          alert("克漏字題選項數量需介於 1 至 6 之間");
          return;
        }
        if (clozeOptions.some((opt) => opt.length === 0)) {
          alert("克漏字題選項不可留空");
          return;
        }
        const sanitizedOrder = sanitizeClozeOrder(
          clozeOptions.length,
          formData.clozeOrder
        );
        if (sanitizedOrder.length !== formData.clozeOrder.length) {
          alert("克漏字題答案索引不可重複且需對應現有空格");
          return;
        }
        if (
          sanitizedOrder.length < 1 ||
          sanitizedOrder.length > clozeOptions.length
        ) {
          alert("克漏字題答案數量需介於 1 與選項數量之間");
          return;
        }
        const uniqueOrder = new Set(sanitizedOrder);
        if (uniqueOrder.size !== sanitizedOrder.length) {
          alert("克漏字題答案順序不可重複");
          return;
        }
        if (
          sanitizedOrder.some((idx) => idx < 0 || idx >= clozeOptions.length)
        ) {
          alert("克漏字題答案索引超出範圍");
          return;
        }
        apiOptions = clozeOptions;
        apiCorrectAnswer = sanitizedOrder;
      }

      const questionData = {
        type: apiType,
        question: formData.question,
        options: apiOptions,
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
    <div className="min-h-screen bg-linear-to-br from-[#FAFAF7] to-[#F7E6C3]/20 relative overflow-hidden">
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
                          onValueChange={(v) => {
                            // 選書時：新增模式立刻帶入來源為該書顯示名稱
                            const selected = BOOKS.find((b) => b.db === v);
                            const display = selected ? selected.display : "";
                            if (!editingQuestion) {
                              setFormData({
                                ...formData,
                                book: v,
                                source: display,
                              });
                            } else {
                              setFormData({ ...formData, book: v });
                            }
                          }}
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
                        onValueChange={(v) => {
                          const nextType = v as QuestionTypeLabel;
                          setFormData((prev) => {
                            if (prev.type === nextType) {
                              return prev;
                            }
                            if (nextType === "單選") {
                              return {
                                ...prev,
                                type: nextType,
                                options: [...DEFAULT_SINGLE_OPTIONS],
                                correctAnswer: [],
                                singleCorrectAnswer: 0,
                              };
                            }
                            if (nextType === "多選") {
                              return {
                                ...prev,
                                type: nextType,
                                options: [...DEFAULT_SINGLE_OPTIONS],
                                correctAnswer: [],
                                singleCorrectAnswer: 0,
                              };
                            }
                            // 克漏字
                            return {
                              ...prev,
                              type: nextType,
                              clozeOptions: createClozeOptions(
                                DEFAULT_CLOZE_OPTION_COUNT
                              ),
                              clozeOrder: createClozeOrder(
                                DEFAULT_CLOZE_OPTION_COUNT
                              ),
                              correctAnswer: [],
                              singleCorrectAnswer: 0,
                            };
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="單選">單選題</SelectItem>
                          <SelectItem value="多選">多選題</SelectItem>
                          <SelectItem value="克漏字">克漏字題</SelectItem>
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

                    {formData.type === "克漏字" && (
                      <div className="space-y-2">
                        <Label>克漏字選項（請輸入 1-6 個提示詞）*</Label>
                        {formData.clozeOptions.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input
                              placeholder={`選項 ${idx + 1}`}
                              value={opt}
                              onChange={(e) =>
                                handleClozeOptionChange(idx, e.target.value)
                              }
                            />
                            {formData.clozeOptions.length >
                              MIN_CLOZE_OPTIONS && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveClozeOption(idx)}
                                className="text-red-500 hover:bg-red-50"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddClozeOption}
                            disabled={
                              formData.clozeOptions.length >= MAX_CLOZE_OPTIONS
                            }
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            新增選項
                          </Button>
                        </div>
                        <p className="text-xs text-[#636e72]">
                          使用者需要依序選出正確答案，下方可設定正解順序。
                        </p>
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
                      {formData.type === "克漏字" && (
                        <div className="space-y-3">
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  clozeOrder: createClozeOrder(
                                    prev.clozeOptions.length
                                  ),
                                }))
                              }
                            >
                              重設順序
                            </Button>
                          </div>
                          {formData.clozeOrder.map((value, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-16 text-sm text-[#636e72]">
                                第 {idx + 1} 空
                              </span>
                              <Select
                                value={String(value)}
                                onValueChange={(v) => {
                                  const parsed = parseInt(v, 10);
                                  if (!Number.isNaN(parsed)) {
                                    handleClozeOrderChange(idx, parsed);
                                  }
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="選擇對應選項" />
                                </SelectTrigger>
                                <SelectContent>
                                  {formData.clozeOptions.map((opt, optIdx) => (
                                    <SelectItem
                                      key={optIdx}
                                      value={String(optIdx)}
                                      disabled={!opt.trim()}
                                    >
                                      {`${optIdx + 1}. ${
                                        opt || `選項 ${optIdx + 1}`
                                      }`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {formData.clozeOrder.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveClozeBlank(idx)}
                                  className="text-red-500 hover:bg-red-50"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAddClozeBlank}
                              disabled={
                                formData.clozeOrder.length >=
                                formData.clozeOptions.length
                              }
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              新增空格
                            </Button>
                          </div>
                          <p className="text-xs text-[#636e72]">
                            提示：順序需涵蓋全部空格且索引不可重複；如有變動，記得同步更新上方選項內容。
                          </p>
                        </div>
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

                    {/* 只讀審計資訊（編輯模式顯示） */}
                    <Label>修改紀錄</Label>
                    {editingQuestion && (
                      <div className="grid md:grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50 border border-[#A8CBB7]/20">
                        <div className="space-y-1">
                          <Label>出題者</Label>
                          <div className="text-sm text-[#2d3436]">
                            {editingQuestion.createdBy || "-"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>出題時間</Label>
                          <div className="text-sm text-[#2d3436]">
                            {editingQuestion.createdAt
                              ? new Date(
                                  editingQuestion.createdAt
                                ).toLocaleString("zh-TW", { hour12: false })
                              : "-"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>修改者</Label>
                          <div className="text-sm text-[#2d3436]">
                            {editingQuestion.updatedBy || "無"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>修改時間</Label>
                          <div className="text-sm text-[#2d3436]">
                            {editingQuestion.updatedAt
                              ? new Date(
                                  editingQuestion.updatedAt
                                ).toLocaleString("zh-TW", { hour12: false })
                              : "無"}
                          </div>
                        </div>
                      </div>
                    )}
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
                        className="bg-linear-to-r from-[#A8CBB7] to-[#9fb8a8] text-white"
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
                        className="bg-linear-to-r from-[#A8CBB7] to-[#9fb8a8] text-white"
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

                {/* 題型篩選 */}
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="題型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部題型</SelectItem>
                    <SelectItem value="單選">單選題</SelectItem>
                    <SelectItem value="多選">多選題</SelectItem>
                    <SelectItem value="克漏字">克漏字題</SelectItem>
                  </SelectContent>
                </Select>

                {/* 書籍篩選 */}
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

                {/* 難度篩選 */}
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

                {/* 正確率排序 */}
                <Select
                  value={sortByAccuracy}
                  onValueChange={setSortByAccuracy}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="正確率排序" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">正確率</SelectItem>
                    <SelectItem value="asc">低到高</SelectItem>
                    <SelectItem value="desc">高到低</SelectItem>
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
                                <div className="space-y-2">
                                  <div
                                    className="truncate overflow-hidden text-ellipsis whitespace-nowrap"
                                    title={q.question}
                                    style={{ maxWidth: "24rem" }}
                                  >
                                    {q.question}
                                  </div>
                                  {q.type === "克漏字" &&
                                    Array.isArray(q.correctAnswer) && (
                                      <div className="text-xs text-[#636e72] space-y-1">
                                        <div className="truncate">
                                          選項：
                                          {(q.options ?? [])
                                            .map(
                                              (opt, idx) =>
                                                `${idx + 1}.${opt || "-"}`
                                            )
                                            .join("， ")}
                                        </div>
                                        <div>
                                          正解順序：
                                          {(q.correctAnswer as number[])
                                            .map((idx) => {
                                              const label =
                                                q.options?.[idx] ?? "-";
                                              return `${idx + 1}.${label}`;
                                            })
                                            .join(" → ")}
                                        </div>
                                      </div>
                                    )}
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
                              <TableCell>{q.createdBy || "-"}</TableCell>
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
