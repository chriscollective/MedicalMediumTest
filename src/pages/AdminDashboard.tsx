import React from "react";
import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { NatureAccents } from "../components/NatureAccents";
import { BarChart3, BookOpen, LogOut, Settings, Trophy } from "lucide-react";
import { logout } from "../services/authService";

interface AdminDashboardProps {
  username: string;
  onNavigate: (page: "analytics" | "questions" | "leaderboard") => void;
  onLogout: () => void;
}

export function AdminDashboard({
  username,
  onNavigate,
  onLogout,
}: AdminDashboardProps) {
  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const menuItems = [
    {
      id: "analytics",
      title: "數據分析",
      description: "查看測驗統計與答題分析",
      color: "from-[#A8CBB7] to-[#9fb8a8]",
      action: () => onNavigate("analytics"),
    },
    {
      id: "leaderboard",
      title: "高分排行榜",
      description: "查看各書籍的高分榜單",
      color: "from-[#E5C17A] to-[#d4b86a]",
      action: () => onNavigate("leaderboard"),
    },
    {
      id: "questions",
      title: "題庫管理",
      description: "新增、編輯與管理測驗題目",
      color: "from-[#F89880] to-[#e07856]",
      action: () => onNavigate("questions"),
    },
    {
      id: "settings",
      title: "管理員設定",
      description: "系統設定與權限管理（開發中）",
      color: "from-[#636e72] to-[#2d3436]",
      action: () => {},
    },
  ];

  // Parse Tailwind-like arbitrary color gradient tokens into hex stops
  // e.g. "from-[#B794F4] to-[#9F7AEA]" -> ["#B794F4", "#9F7AEA"]
  const parseGradientStops = (colorSpec: string): string[] | null => {
    const matches = [...colorSpec.matchAll(/#([A-Fa-f0-9]{6})/g)].map(
      (m) => `#${m[1]}`
    );
    return matches.length >= 2 ? matches.slice(0, 2) : null;
  };

  const getIcon = (id: string) => {
    switch (id) {
      case "analytics":
        return <BarChart3 className="w-7 h-7 text-white" />;
      case "leaderboard":
        return <Trophy className="w-7 h-7 text-white" />;
      case "questions":
        return <BookOpen className="w-7 h-7 text-white" />;
      case "settings":
        return <Settings className="w-7 h-7 text-white" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF7] to-[#F7E6C3]/20 relative overflow-hidden">
      {/* Nature Accents */}
      <NatureAccents variant="minimal" />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-[#A8CBB7]/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h2 className="text-[#2d3436]">管理後台</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#636e72]">歡迎，{username}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-[#A8CBB7] text-[#A8CBB7] hover:bg-[#A8CBB7] hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              登出
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {menuItems.map((item, index) => (
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
                    {getIcon(item.id)}
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
