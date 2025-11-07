import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Loader2, AlertCircle } from "lucide-react";
import { submitIssueReport } from "../services/reportService";

interface ReportIssueDialogProps {
  open: boolean;
  onClose: () => void;
}

const books = ["搶救肝臟", "神奇西芹汁", "改變生命的食物", "其他"];

const questionTypes = ["單選題", "多選題", "克漏字題"];

const issueTypes = [
  "錯字或標點符號錯誤",
  "題目內容有誤",
  "答案錯誤",
  "觀念錯誤",
  "選項不清楚",
  "其他問題",
];

export function ReportIssueDialog({ open, onClose }: ReportIssueDialogProps) {
  const [bookName, setBookName] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [questionContent, setQuestionContent] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 驗證必填欄位
    if (!bookName || !questionType || !questionContent || !issueDescription) {
      setError("請填寫所有必填欄位");
      return;
    }

    setSubmitting(true);

    try {
      await submitIssueReport({
        bookName,
        questionType,
        questionContent,
        issueDescription,
      });

      // 成功後清空表單並關閉
      setBookName("");
      setQuestionType("");
      setQuestionContent("");
      setIssueDescription("");
      alert("感謝您的回報！我們會盡快處理。");
      onClose();
    } catch (err) {
      console.error("提交失敗:", err);
      setError("提交失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2d3436]">
            問題回報：修正與疑慮
          </DialogTitle>
          <DialogDescription className="text-[#636e72]">
            發現題目有問題嗎？請告訴我們，幫助我們改進！
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* 1. 書籍名稱 */}
          <div className="space-y-2">
            <Label htmlFor="bookName" className="text-[#2d3436] font-medium">
              1. 請選擇書籍名稱 <span className="text-red-500">*</span>
            </Label>
            <Select value={bookName} onValueChange={setBookName}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="請選擇書籍" />
              </SelectTrigger>
              <SelectContent>
                {books.map((book) => (
                  <SelectItem key={book} value={book}>
                    {book}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. 題型 */}
          <div className="space-y-2">
            <Label
              htmlFor="questionType"
              className="text-[#2d3436] font-medium"
            >
              2. 請選擇題型 <span className="text-red-500">*</span>
            </Label>
            <Select value={questionType} onValueChange={setQuestionType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="請選擇題型" />
              </SelectTrigger>
              <SelectContent>
                {questionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. 題目內容 */}
          <div className="space-y-2">
            <Label
              htmlFor="questionContent"
              className="text-[#2d3436] font-medium"
            >
              3. 請說明題目內容 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="questionContent"
              value={questionContent}
              onChange={(e) => setQuestionContent(e.target.value)}
              placeholder="請盡量詳細描述題目內容，例如：題目的前幾個字、選項內容等，方便我們快速找到該題目"
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* 4. 修正與疑慮 */}
          <div className="space-y-2">
            <Label
              htmlFor="issueDescription"
              className="text-[#2d3436] font-medium"
            >
              4. 修正與疑慮 <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-[#636e72]">
              希望我們修改的部分是什麼？（錯字、內容有誤、觀念錯誤等）
            </p>
            <Textarea
              id="issueDescription"
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="請詳細說明您發現的問題，例如：&#10;- 選項 B 的「肝臓」應該是「肝臟」&#10;- 答案應該是 A 而不是 B，因為書中第 XX 頁提到...&#10;- 題目觀念錯誤，根據醫療靈媒的說法應該是..."
              className="min-h-[150px] resize-none"
            />
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* 按鈕組 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 border-[#A8CBB7] text-[#A8CBB7] hover:bg-[#A8CBB7]/10"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8] text-white hover:shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                "提交回報表單"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
