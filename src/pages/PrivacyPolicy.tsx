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

interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  const { isMobile } = useIsMobile();
  return (
    <div className="min-h-screen relative  overflow-hidden bg-gradient-to-br from-[#FAFAF7] via-[#F7E6C3]/20 to-[#A8CBB7]/10">
      {/* 背景（沿用首頁） */}
      <div
        className={`absolute inset-0 opacity-30 overflow-hidden ${
          isMobile ? "hidden" : ""
        }`}
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

      {/* 透明頂部列（置中標題） */}
      <div className="relative z-10 bg-transparent pt-100  ">
        <div className="container mx-auto px-4 py-16 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 text-[#2d3436]">
              <Sparkles className="w-6 h-6 text-[#A8CBB7]" />
              <span className="text-2xl font-extrabold">隱私政策</span>
              <Sparkles className="w-6 h-6 text-[#A8CBB7]" />
            </div>
          </div>
          <div className="flex items-center justify-end"></div>
        </div>
      </div>

      {/* 內容區塊（與頂部列拉開距離） */}
      <div className="relative z-10 container mx-auto px-4 pt-28 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 20 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* 最後更新日期 */}
          <div className="text-center text-sm text-[#636e72]">
            最後更新日期：2025 年 11 月 2 日
          </div>

          {/* 1. 資料收集與使用 */}
          <Card className="border-[#A8CBB7]/20">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">
                1. 我們收集哪些資料
              </CardTitle>
              <CardDescription className="text-[#636e72]">
                為了提供測驗服務與改善使用者體驗
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[#2d3436] space-y-4">
              <div>
                <h4 className="font-semibold mb-2">測驗相關資料</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>
                    <strong>匿名識別碼（UUID）</strong>
                    ：在您的瀏覽器本地產生，用於識別不同的測驗記錄
                  </li>
                  <li>
                    <strong>測驗結果</strong>
                    ：分數、答對題數、所選書籍、難度、作答時間
                  </li>
                  <li>
                    <strong>排行榜暱稱</strong>
                    ：僅在您自願提交排行榜時收集
                  </li>
                  <li>
                    <strong>答題記錄</strong>：用於產生錯題統計與學習分析
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 2. 第三方服務 */}
          <Card className="border-[#A8CBB7]/20">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">2. 第三方服務</CardTitle>
              <CardDescription className="text-[#636e72]">
                本網站使用以下第三方服務
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[#2d3436] space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Vercel Analytics</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>
                    <strong>用途</strong>
                    ：網站流量分析、效能監控、使用者體驗優化
                  </li>
                  <li>
                    <strong>收集資料</strong>
                    ：頁面瀏覽、裝置類型、地理位置（國家/地區）、訪問時間
                  </li>
                  <li>
                    <strong>隱私保護</strong>：Vercel Analytics
                    不使用Cookie，不追蹤個人身份
                  </li>
                  <li>
                    <strong>了解更多</strong>：
                    <a
                      href="https://vercel.com/docs/analytics/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#A8CBB7] hover:underline ml-1"
                    >
                      Vercel Analytics 隱私政策
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">
                  MongoDB Atlas（資料庫託管）
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>
                    <strong>用途</strong>：儲存題目、測驗記錄、排行榜資料
                  </li>
                  <li>
                    <strong>資料位置</strong>
                    ：雲端資料庫，採用加密傳輸與儲存
                  </li>
                  <li>
                    <strong>隱私保護</strong>
                    ：所有資料匿名化，不儲存個人識別資訊
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 3. Cookie 與本地儲存 */}
          <Card className="border-[#A8CBB7]/20">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">
                3. Cookie 與本地儲存
              </CardTitle>
              <CardDescription className="text-[#636e72]">
                本網站如何使用瀏覽器儲存功能
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[#2d3436] space-y-3">
              <p className="text-sm">
                本網站並無使用Cookie，而是使用瀏覽器的
                localStorage（本地儲存）功能，用於：
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  <strong>使用者識別碼</strong>
                  ：儲存您的匿名UUID，以便追蹤您的測驗歷史
                </li>
                <li>
                  <strong>管理員登入狀態</strong>
                  ：儲存管理員的認證Token（僅限管理後台）
                </li>
                <li>
                  <strong>頁面狀態</strong>
                  ：記住您上次的頁面位置，提供更好的使用體驗
                </li>
              </ul>
              <p className="text-sm text-[#636e72] mt-3">
                註：您可以隨時清除瀏覽器的本地儲存資料，但這將重置您的測驗記錄。
              </p>
            </CardContent>
          </Card>

          {/* 4. 資料使用目的 */}
          <Card className="border-[#A8CBB7]/20">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">4. 資料使用目的</CardTitle>
              <CardDescription className="text-[#636e72]">
                我們如何使用收集的資料
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[#2d3436] space-y-2">
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>提供測驗服務與計算成績</li>
                <li>產生排行榜與統計分析</li>
                <li>分析錯題分布，優化題目品質</li>
                <li>了解網站使用情況，改善使用者體驗</li>
                <li>監控網站效能，確保服務穩定</li>
                <li>偵測異常行為，維護系統安全</li>
              </ul>
            </CardContent>
          </Card>

          {/* 5. 資料保護 */}
          <Card className="border-[#A8CBB7]/20">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">5. 資料保護措施</CardTitle>
              <CardDescription className="text-[#636e72]">
                我們如何保護您的資料
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[#2d3436] space-y-2">
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  <strong>匿名化設計</strong>
                  ：不收集姓名、電子郵件、手機號碼等個人識別資訊
                </li>
                <li>
                  <strong>加密傳輸</strong>：所有資料傳輸使用 HTTPS 加密協定
                </li>
                <li>
                  <strong>安全儲存</strong>
                  ：資料庫採用業界標準的加密與存取控制
                </li>
                <li>
                  <strong>有限存取</strong>
                  ：僅授權管理員可存取後台統計資料
                </li>
                <li>
                  <strong>定期審查</strong>：持續檢視與更新安全措施
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 6. 題庫來源 */}
          <Card className="border-[#A8CBB7]/20">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">6. 題庫來源</CardTitle>
              <CardDescription className="text-[#636e72]">
                測驗題目的編撰說明
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[#2d3436] space-y-2">
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  題目依據醫療靈媒相關書籍的公開內容整理撰寫，用於學習練習
                </li>
                <li>題目內容會持續修訂與更新，以確保正確性</li>
                <li>本網站非官方平台，與原作者或出版社無正式關聯</li>
                <li>題目僅供個人學習使用，不得用於商業用途</li>
              </ul>
            </CardContent>
          </Card>

          {/* 7. 政策變更 */}
          <Card className="border-[#A8CBB7]/20">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">7. 隱私政策變更</CardTitle>
              <CardDescription className="text-[#636e72]">
                政策更新通知
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[#2d3436] space-y-2">
              <p className="text-sm">
                我們可能會不定期更新本隱私政策。重大變更時，我們會在網站首頁顯著位置公告。建議您定期查閱本頁面，以了解最新的隱私保護措施。
              </p>
              <p className="text-sm text-[#636e72] mt-3">
                繼續使用本網站即表示您同意本隱私政策的條款。
              </p>
            </CardContent>
          </Card>

          {/* 8. 聯絡資訊 */}
          <Card className="border-[#A8CBB7]/20">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">8. 聯絡我們</CardTitle>
              <CardDescription className="text-[#636e72]">
                如有隱私相關疑問
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[#2d3436] space-y-2">
              <p className="text-sm">
                如果您對本隱私政策有任何疑問，或希望行使您的資料權利，歡迎透過以下方式聯絡我們：
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-[#636e72]">
                <li>Email:justakiss918@gmail.com</li>
              </ul>
            </CardContent>
          </Card>

          <div
            className="flex justify-center pt-8 pb-8"
            style={{ marginBottom: "80px" }}
          >
            <Button
              onClick={onBack}
              className="px-8 py-6 rounded-2xl cursor-pointer bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8] text-white shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> 返回首頁
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
