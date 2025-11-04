import React from "react";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { NaturalPattern } from "../components/NaturalPattern";
import { NatureDecoration } from "../components/NatureDecoration";
import { FloatingHerbs } from "../components/FloatingHerbs";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useIsMobile } from "../utils/useIsMobile";

interface AboutProps {
  onBack: () => void;
}

export function About({ onBack }: AboutProps) {
  const { isMobile } = useIsMobile();
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#FAFAF7] via-[#F7E6C3]/20 to-[#A8CBB7]/10">
      {/* 背景（沿用首頁） */}
      <div
        className={`absolute inset-0 opacity-30 ${isMobile ? "hidden" : ""}`}
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1604248215430-100912b27ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0JTIwbmF0dXJlJTIwbGVhdmVzJTIwbGlnaHR8ZW58MXx8fHwxNzYxODA3MjI2fDA&ixlib=rb-4.1.0&q=80&w=1080')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(60px)",
        }}
      />

      {/* 裝飾元素 */}
      <NaturalPattern />
      {!isMobile && <NatureDecoration />}
      {!isMobile && <FloatingHerbs />}

      {/* 透明頂部列（置中標題，右側返回） */}
      <div className="relative z-10 bg-transparent pt-100  ">
        <div className="container mx-auto px-4 py-16 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 text-[#2d3436]">
              <Sparkles className="w-6 h-6 text-[#A8CBB7]" />
              <span className="text-2xl font-extrabold">關於本站</span>
              <Sparkles className="w-6 h-6 text-[#A8CBB7]" />
            </div>
          </div>
          <div className="flex items-center justify-end"></div>
        </div>
      </div>

      {/* 內容區塊（與頂部列拉開距離） */}
      <div className="relative z-10 container mx-auto px-4 pt-28 pb-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 20 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <Card className="border-[#A8CBB7]/20 mt-8">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">我們的目標</CardTitle>
              <CardDescription className="text-[#636e72]">
                以輕量有趣的方式，幫助讀者複習與檢視「醫療靈媒」相關知識。
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[#2d3436] space-y-4">
              <p>
                本站為非官方學習平台，透過單選、多選、填空等題型，協助你快速檢視章節重點與理解程度。
              </p>
              <p>
                你可以選擇書籍與難度進行 20
                題測驗，完成後立即查看分數與錯題清單，方便回顧與精進。
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#A8CBB7]/20">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">免責聲明</CardTitle>
            </CardHeader>
            <CardContent className="text-[#2d3436]">
              本站內容僅供教育與自我檢測，不構成任何醫療建議、診斷或治療。如有健康疑慮，請諮詢合格醫療人員。本站與原作者或出版社無任何關聯或授權。
            </CardContent>
          </Card>

          <Card className="border-[#A8CBB7]/20">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">關於站長</CardTitle>
            </CardHeader>
            <CardContent className="text-[#2d3436]">
              <p>
                我是站長Chris，因為喜愛醫療靈媒的內容而製作了這個網站，希望各位粉絲可以玩得愉快!
              </p>
              <p>
                讓我們一起走在療癒的路上，感謝慈悲高靈、安東尼、以及醫療靈媒粉絲團各位熱情的粉絲們!
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#A8CBB7]/20">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">聯絡方式</CardTitle>
            </CardHeader>
            <CardContent className="text-[#2d3436]">
              <p>
                意見回饋與錯誤回報：請寄信至 E-mail:justakiss918@gmail.com
                或填寫表單（連結）。
              </p>
              <p>
                內容修正與下架請求：請提供具體書籍/題型/題目內容，我們會盡速處理。
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#A8CBB7]/20">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">特別感謝</CardTitle>
            </CardHeader>
            <CardContent className="text-[#2d3436]">
              <p>
                感謝醫療靈媒粉絲團，《HELENE
                BEBE》提供素材、，讓這個網站有豐富的題庫!再次感謝所有參與這個網站的粉絲們!
              </p>
            </CardContent>
          </Card>

          <div
            className="flex justify-center pt-2"
            style={{ marginBottom: "80px" }}
          >
            <Button
              onClick={onBack}
              className="px-8 py-6 cursor-pointer rounded-2xl bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8] text-white shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> 返回首頁
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
