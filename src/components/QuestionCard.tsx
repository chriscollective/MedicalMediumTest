import React, { useState } from "react";
import { Card } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Leaf } from "lucide-react";

export interface Question {
  id: string;
  type: "single" | "multiple" | "fill";
  question: string;
  options?: string[];
  fillOptions?: string[];
  correctAnswer: string | string[];
  source?: string;
  explanation?: string;
}

interface QuestionCardProps {
  question: Question;
  index: number;
  userAnswer?: string | string[];
  onAnswerChange: (answer: string | string[]) => void;
}

export function QuestionCard({
  question,
  index,
  userAnswer,
  onAnswerChange,
}: QuestionCardProps) {
  // ✅ 僅在填空題初始化狀態
  const [selectedFill, setSelectedFill] = useState(
    question.type === "fill" && typeof userAnswer === "string" ? userAnswer : ""
  );

  // 單選
  const handleSingleChoice = (value: string) => {
    onAnswerChange(value);
  };

  // 複選
  const handleMultipleChoice = (
    option: string,
    checked: boolean | "indeterminate"
  ) => {
    const current = (userAnswer as string[]) || [];
    const updated =
      checked === true
        ? [...current, option]
        : current.filter((a) => a !== option);
    onAnswerChange(updated);
  };

  // 填空
  const handleFillClick = (word: string) => {
    setSelectedFill(word);
    onAnswerChange(word);
  };

  return (
    <Card className="p-6 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 border-[#A8CBB7]/20 relative overflow-hidden">
      {/* 🌿 裝飾元素 */}
      <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
        <Leaf className="w-32 h-32 text-[#A8CBB7] rotate-12" />
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-start gap-3">
          <Badge className="bg-[#A8CBB7] text-white shrink-0">
            Q{index + 1}
          </Badge>
          <p className="flex-1">{question.question}</p>
        </div>

        {question.source && (
          <p className="text-xs text-[#636e72]">{question.source}</p>
        )}

        <div className="space-y-3">
          {/* ✅ 單選題 */}
          {question.type === "single" && question.options && (
            <RadioGroup
              name={`question-${index}-${question.id}`}
              value={(userAnswer as string) || ""}
              onValueChange={handleSingleChoice}
            >
              {question.options.map((option, idx) => {
                const optionId = `q-${index}-${question.id}-${idx}`;
                return (
                  <div
                    key={optionId}
                    className="flex items-center space-x-2 p-3 rounded-lg hover:bg-[#F7E6C3]/20 transition-colors"
                  >
                    <RadioGroupItem value={option} id={optionId} />
                    <Label htmlFor={optionId} className="cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          )}

          {/* ✅ 複選題 */}
          {question.type === "multiple" && question.options && (
            <div className="space-y-2">
              {question.options.map((option, idx) => {
                const optionId = `q-${index}-${question.id}-${idx}`;
                const checked =
                  (userAnswer as string[] | undefined)?.includes(option) ||
                  false;
                return (
                  <div
                    key={optionId}
                    className="flex items-center space-x-2 p-3 rounded-lg hover:bg-[#F7E6C3]/20 transition-colors"
                  >
                    <Checkbox
                      id={optionId}
                      checked={checked}
                      onCheckedChange={(state) =>
                        handleMultipleChoice(option, state)
                      }
                    />
                    <Label htmlFor={optionId} className="cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}

          {/* ✅ 填空題 */}
          {question.type === "fill" && question.fillOptions && (
            <div className="space-y-3">
              <div className="p-4 bg-[#F7E6C3]/30 rounded-lg min-h-[60px] flex items-center justify-center">
                {selectedFill ? (
                  <Badge className="bg-[#A8CBB7] text-white">
                    {selectedFill}
                  </Badge>
                ) : (
                  <span className="text-[#636e72] text-sm">請選擇答案</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {question.fillOptions.map((word, idx) => {
                  const active = selectedFill === word;
                  return (
                    <Badge
                      key={`fill-${index}-${question.id}-${idx}`}
                      className={`cursor-pointer transition-all duration-200 ${
                        active
                          ? "bg-[#E5C17A] text-white shadow-md"
                          : "border border-[#A8CBB7] hover:bg-[#F7E6C3]/50"
                      }`}
                      onClick={() => handleFillClick(word)}
                    >
                      {word}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
