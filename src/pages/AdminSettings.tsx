import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { NatureAccents } from "../components/NatureAccents";
import { ArrowLeft, KeyRound, Users, MessageSquare } from "lucide-react";
import { changePassword as changePasswordApi } from "../services/authService";

interface AdminSettingsProps {
  onBack: () => void;
}

export function AdminSettings({ onBack }: AdminSettingsProps) {
  const [mode, setMode] = useState<null | "change-password">(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const items = [
    {
      id: "change-password",
      title: "修改密碼",
      description: "變更目前管理員的登入密碼",
      icon: <KeyRound className="w-6 h-6 text-white" />,
      color: "from-[#A8CBB7] to-[#9fb8a8]",
      action: () => setMode("change-password"),
    },
    {
      id: "admin-list",
      title: "管理員名單",
      description: "檢視或管理現有管理員帳號",
      icon: <Users className="w-6 h-6 text-white" />,
      color: "from-[#E5C17A] to-[#d4b86a]",
      action: () => alert("管理員名單：\nChris\nBebe\nMiruki"),
    },
    {
      id: "feedback",
      title: "修改建議與問題回報",
      description: "提出改善建議或錯誤回報",
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      color: "from-[#A8CBB7] to-[#2d3436]",
      action: () => alert("管理員名單：\nChris\nBebe\nMiruki"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF7] to-[#F7E6C3]/20 relative overflow-hidden">
      <NatureAccents variant="minimal" />
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
        {/* 成功提示視窗 */}
        <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>密碼已更新</DialogTitle>
              <DialogDescription>
                你的登入密碼已成功變更。下次登入請使用新密碼。
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setSuccessOpen(false)}
                className="bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8] text-white"
              >
                知道了
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {mode === "change-password" && (
          <Card className="max-w-xl mx-auto mb-8 border-[#A8CBB7]/20">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">修改密碼</CardTitle>
              <CardDescription className="text-[#636e72]">
                請輸入目前密碼與新密碼
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {message && (
                <div className="text-sm text-[#2d3436]">{message}</div>
              )}
              <div>
                <label className="block text-sm text-[#2d3436] mb-1">
                  目前密碼
                </label>
                <input
                  type="password"
                  className="w-full border rounded-md px-3 py-2 border-[#A8CBB7]/40 focus:outline-none focus:ring-2 focus:ring-[#A8CBB7]"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-[#2d3436] mb-1">
                  新密碼
                </label>
                <input
                  type="password"
                  className="w-full border rounded-md px-3 py-2 border-[#A8CBB7]/40 focus:outline-none focus:ring-2 focus:ring-[#A8CBB7]"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-[#2d3436] mb-1">
                  確認新密碼
                </label>
                <input
                  type="password"
                  className="w-full border rounded-md px-3 py-2 border-[#A8CBB7]/40 focus:outline-none focus:ring-2 focus:ring-[#A8CBB7]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-[#A8CBB7] text-[#2d3436]"
                  disabled={loading}
                  onClick={() => {
                    setMode(null);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setMessage(null);
                  }}
                >
                  取消
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8] text-white"
                  disabled={loading}
                  onClick={async () => {
                    try {
                      setMessage(null);
                      if (
                        !currentPassword ||
                        !newPassword ||
                        !confirmPassword
                      ) {
                        setMessage("請完整填寫");
                        return;
                      }
                      if (newPassword.length < 6) {
                        setMessage("新密碼至少 6 碼");
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        setMessage("兩次新密碼不一致");
                        return;
                      }
                      if (newPassword === currentPassword) {
                        setMessage("新密碼不可與目前密碼相同");
                        return;
                      }
                      setLoading(true);
                      await changePasswordApi(currentPassword, newPassword);
                      setMessage("密碼已更新");
                      setSuccessOpen(true);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    } catch (e: any) {
                      setMessage(e?.response?.data?.message || "更新失敗");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  送出修改
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${it.color} flex items-center justify-center mb-3`}
                  >
                    {it.icon}
                  </div>
                  <CardTitle className="text-[#2d3436]">{it.title}</CardTitle>
                  <CardDescription className="text-[#636e72]">
                    {it.description}
                  </CardDescription>
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
