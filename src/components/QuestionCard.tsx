import React, { useState } from "react";
import { Card } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Leaf, X } from "lucide-react";

export interface Question {
  id: string;
  type: "single" | "multiple" | "cloze";
  question: string;
  options?: string[];
  clozeLength?: number;
  correctAnswer?: string | string[];
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
  const clozeSelected =
    question.type === "cloze" && Array.isArray(userAnswer)
      ? (userAnswer as string[])
      : [];

  const CLOZE_MAX_SELECTION = 6;
  const clozeTargetCount =
    question.type === "cloze"
      ? question.clozeLength && question.clozeLength > 0
        ? question.clozeLength
        : Math.min(
            question.options?.length ?? CLOZE_MAX_SELECTION,
            CLOZE_MAX_SELECTION
          )
      : 0;

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

  const handleClozeSelect = (option: string) => {
    if (question.type !== "cloze") return;
    if (!question.options || clozeTargetCount === 0) return;
    if (clozeSelected.includes(option)) return;
    if (clozeSelected.length >= clozeTargetCount) return;
    onAnswerChange([...clozeSelected, option]);
  };

  const handleClozeRemove = (slotIndex: number) => {
    if (question.type !== "cloze") return;
    const updated = clozeSelected.filter((_, idx) => idx !== slotIndex);
    onAnswerChange(updated);
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

          {/* ✅ 克漏字題 */}
          {question.type === "cloze" &&
            question.options &&
            clozeTargetCount > 0 && (
              <div className="space-y-3">
                <div className="p-4 bg-[#F7E6C3]/30 rounded-lg min-h-[60px] flex items-center flex-wrap gap-2">
                  {clozeSelected.length === 0 ? (
                    <span className="text-[#636e72] text-sm">
                      請依序點選答案，可再點擊移除重選
                    </span>
                  ) : (
                    clozeSelected.map((value, idx) => (
                      <Badge
                        key={`cloze-answer-${question.id}-${idx}`}
                        className="bg-[#A8CBB7] text-white cursor-pointer"
                        onClick={() => handleClozeRemove(idx)}
                      >
                        {clozeSelected.length > 1 && (
                          <span className="mr-1 font-semibold">{idx + 1}.</span>
                        )}
                        {value}
                      </Badge>
                    ))
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {question.options.map((option, idx) => {
                    const selected = clozeSelected.includes(option);
                    return (
                      <Badge
                        key={`cloze-option-${question.id}-${idx}`}
                        className={`cursor-pointer transition-all duration-200 ${
                          selected
                            ? "bg-[#E5C17A] text-white shadow-md"
                            : "border border-[#A8CBB7] hover:bg-[#F7E6C3]/50"
                        }`}
                        onClick={() => handleClozeSelect(option)}
                      >
                        {option}
                      </Badge>
                    );
                  })}
                </div>

                <p className="text-xs text-[#636e72]">
                  點擊選項加入、點擊上方答案移除。
                </p>
              </div>
            )}
        </div>
      </div>
    </Card>
  );
}
