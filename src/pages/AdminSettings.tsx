import React, { useEffect, useState } from "react";
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
import {
  changePassword as changePasswordApi,
  getCurrentUser,
} from "../services/authService";
import {
  getAdminsBasic,
  updateMyNote as updateMyNoteApi,
} from "../services/authService";

interface AdminSettingsProps {
  onBack: () => void;
}

export function AdminSettings({ onBack }: AdminSettingsProps) {
  const [mode, setMode] = useState<null | "change-password" | "admin-list">(
    null
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState("");
  const admins = ["Chris", "Bebe", "Miruki"];

  useEffect(() => {
    try {
      const u = (getCurrentUser()?.username || "").toLowerCase();
      setCurrentUser(u);
    } catch {}
  }, []);

  useEffect(() => {
    if (mode !== "admin-list") return;
    (async () => {
      try {
        const list = await getAdminsBasic();
        const map: Record<string, string> = {};
        list.forEach((a) => (map[a.username] = a.note || ""));
        setNotes(map);
      } catch {}
    })();
  }, [mode]);

  // Parse Tailwind-like arbitrary color gradient tokens into hex stops
  // e.g. "from-[#B794F4] to-[#9F7AEA]" -> ["#B794F4", "#9F7AEA"]
  const parseGradientStops = (colorSpec: string): string[] | null => {
    const matches = [...colorSpec.matchAll(/#([A-Fa-f0-9]{6})/g)].map(
      (m) => `#${m[1]}`
    );
    return matches.length >= 2 ? matches.slice(0, 2) : null;
  };

  const items = [
    {
      id: "change-password",
      title: "修改密碼",
      description: "更新目前管理員的登入密碼",
      icon: <KeyRound className="w-7 h-7 text-white" />,
      color: "from-[#A8CBB7] to-[#9fb8a8]",
      action: () => setMode("change-password"),
    },
    {
      id: "admin-list",
      title: "管理員名單",
      description: "僅顯示名稱與各自的想說的話",
      icon: <Users className="w-7 h-7 text-white" />,
      color: "from-[#E5C17A] to-[#d4b86a]",
      action: () => setMode("admin-list"),
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
        <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>密碼已更新</DialogTitle>
              <DialogDescription>
                你的登入密碼已更新。下次登入請使用新密碼。
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
                        setMessage("請完整輸入");
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
                        setMessage("新密碼不可與目前相同");
                        return;
                      }
                      setLoading(true);
                      await changePasswordApi(currentPassword, newPassword);
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

        {mode === "admin-list" && (
          <Card className="max-w-5xl mx-auto mb-8 border-[#A8CBB7]/20">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">管理員名單</CardTitle>
              <CardDescription className="text-[#636e72]">
                僅顯示名稱與各自的「想說的話」；只有本人可以編輯。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {admins.map((name) => {
                  const editable = name.toLowerCase() === currentUser;
                  const isEditing = editingName === name;
                  return (
                    <Card key={name} className="border-[#A8CBB7]/20">
                      <CardHeader>
                        <CardTitle className="text-[#2d3436]">{name}</CardTitle>
                        <CardDescription className="text-[#636e72]">
                          辛勤且神聖的管理員
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <label className="block text-sm text-[#2d3436] mb-1">
                          想說的話
                        </label>

                        {editable && isEditing ? (
                          <>
                            <textarea
                              className="w-full h-24 border rounded-md px-3 py-2 border-[#A8CBB7]/40 focus:outline-none focus:ring-2 focus:ring-[#A8CBB7]"
                              value={notes[name] || ""}
                              onChange={(e) =>
                                setNotes((prev) => ({
                                  ...prev,
                                  [name]: e.target.value,
                                }))
                              }
                            />
                            <div className="flex justify-end gap-2 pt-2">
                              <Button
                                variant="outline"
                                className="border-[#A8CBB7] text-[#2d3436]"
                                onClick={() => setEditingName(null)}
                              >
                                取消
                              </Button>
                              <Button
                                className="bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8] text-white"
                                onClick={async () => {
                                  try {
                                    await updateMyNoteApi(notes[name] || "");
                                    setEditingName(null);
                                    const list = await getAdminsBasic();
                                    const map: Record<string, string> = {};
                                    list.forEach(
                                      (a) => (map[a.username] = a.note || "")
                                    );
                                    setNotes(map);
                                  } catch {
                                    alert("儲存失敗，請稍後再試");
                                  }
                                }}
                              >
                                儲存
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-3 rounded-md border border-[#A8CBB7]/20 bg-[#FAFAF7] text-[#2d3436] text-sm min-h-[96px] whitespace-pre-wrap">
                              {notes[name] || "（尚無內容）"}
                            </div>
                            {editable && (
                              <div className="flex justify-end pt-2">
                                <Button
                                  variant="ghost"
                                  className="text-[#A8CBB7] hover:bg-[#F7E6C3]/30"
                                  onClick={() => setEditingName(name)}
                                >
                                  編輯
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className="
                  cursor-pointer
                  hover:shadow-xl hover:scale-105
                  transition-all duration-300
                  border-[#A8CBB7]/20
                  overflow-hidden
                  group
                "
                onClick={item.action}
              >
                {(() => {
                  const stops = parseGradientStops(item.color);
                  if (stops) {
                    return (
                      <div
                        className={`h-2 bg-gradient-to-r ${item.color}`}
                        style={{
                          backgroundImage: `linear-gradient(to right, ${stops[0]}, ${stops[1]})`,
                        }}
                      />
                    );
                  }
                  // Fallback to class-based if parsing fails
                  return (
                    <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                  );
                })()}
                <CardHeader>
                  <div
                    className="
                    inline-flex items-center justify-center
                    w-14 h-14 rounded-2xl mb-4
                    bg-gradient-to-br ${item.color}
                    group-hover:scale-110
                    transition-transform duration-300
                  "
                    style={(() => {
                      const stops = parseGradientStops(item.color);
                      return stops
                        ? {
                            backgroundImage: `linear-gradient(to bottom right, ${stops[0]}, ${stops[1]})`,
                          }
                        : undefined;
                    })()}
                  >
                    {item.icon}
                  </div>
                  <CardTitle className="text-[#2d3436]">{item.title}</CardTitle>
                  <CardDescription className="text-[#636e72]">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="w-full text-[#A8CBB7] hover:bg-[#F7E6C3]/30"
                  >
                    進入管理 →
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
