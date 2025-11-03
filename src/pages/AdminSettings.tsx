import React from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { NatureAccents } from "../components/NatureAccents";
import { ArrowLeft, KeyRound, Users, MessageSquare } from "lucide-react";

interface AdminSettingsProps {
  onBack: () => void;
}

export function AdminSettings({ onBack }: AdminSettingsProps) {
  const items = [
    {
      id: "change-password",
      title: "修改密碼",
      description: "變更目前管理員的登入密碼",
      icon: <KeyRound className="w-6 h-6 text-white" />,
      color: "from-[#A8CBB7] to-[#9fb8a8]",
      action: () => alert("此功能待實作：修改密碼"),
    },
    {
      id: "admin-list",
      title: "管理員名單",
      description: "檢視或管理現有管理員帳號",
      icon: <Users className="w-6 h-6 text-white" />,
      color: "from-[#E5C17A] to-[#d4b86a]",
      action: () => alert("此功能待實作：管理員名單"),
    },
    {
      id: "feedback",
      title: "修改建議與問題回報",
      description: "提出改善建議或錯誤回報",
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      color: "from-[#A8CBB7] to-[#2d3436]",
      action: () => alert("此功能待實作：修改建議與問題回報"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF7] to-[#F7E6C3]/20 relative overflow-hidden">
      <NatureAccents variant="minimal" />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-[#A8CBB7]/20">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-[#A8CBB7] hover:bg-[#F7E6C3]/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> 返回
          </Button>
          <h2 className="text-[#2d3436]">管理員設定</h2>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {items.map((it, idx) => (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card className="border-[#A8CBB7]/20 overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${it.color}`} />
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${it.color} flex items-center justify-center mb-3`}>
                    {it.icon}
                  </div>
                  <CardTitle className="text-[#2d3436]">{it.title}</CardTitle>
                  <CardDescription className="text-[#636e72]">{it.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="text-[#A8CBB7] hover:bg-[#F7E6C3]/30 w-full"
                    onClick={it.action}
                  >
                    開啟
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

