import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { NatureAccents } from '../components/NatureAccents';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, Users, Award, TrendingUp, BookOpen, Loader2 } from 'lucide-react';
import {
  getAnalyticsSummary,
  AnalyticsSummary,
  getGradeDistribution,
  getBookDistribution,
  getWrongQuestions,
  GradeDistribution,
  BookDistribution,
  WrongQuestion
} from '../services/analyticsService';

interface AnalyticsProps {
  onBack: () => void;
}

// Color mapping for grades
const gradeColors: Record<string, string> = {
  'S': '#E5C17A',
  'A+': '#A8CBB7',
  'A': '#9fb8a8',
  'B+': '#F7E6C3',
  'B': '#d9dcd9',
  'C+': '#b0b0b0',
  'F': '#8a8a8a'
};

// Color mapping for books
const bookColors: string[] = ['#A8CBB7', '#E5C17A', '#F7E6C3', '#9fb8a8', '#d9dcd9'];

export function Analytics({ onBack }: AnalyticsProps) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [gradeDistribution, setGradeDistribution] = useState<Array<GradeDistribution & { fill: string }>>([]);
  const [bookParticipation, setBookParticipation] = useState<Array<BookDistribution & { fill: string }>>([]);
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);

        // 並行載入所有統計資料
        const [summaryData, gradeData, bookData, wrongQuestionsData] = await Promise.all([
          getAnalyticsSummary(),
          getGradeDistribution(),
          getBookDistribution(),
          getWrongQuestions(10)
        ]);

        setSummary(summaryData);

        // 為等級分布添加顏色
        const gradeWithColors = gradeData.map(item => ({
          ...item,
          fill: gradeColors[item.name] || '#A8CBB7'
        }));
        setGradeDistribution(gradeWithColors);

        // 為書籍分布添加顏色
        const bookWithColors = bookData.map((item, index) => ({
          ...item,
          fill: bookColors[index % bookColors.length]
        }));
        setBookParticipation(bookWithColors);

        // 設定錯題排行榜
        setWrongQuestions(wrongQuestionsData);

      } catch (error) {
        console.error('載入統計資料失敗:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  // 獲取平均等級（基於分數）
  const getAverageGrade = () => {
    if (!summary) return '-';
    return summary.avgGrade;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF7] to-[#F7E6C3]/20 relative overflow-hidden">
      {/* Nature Accents */}
      <NatureAccents variant="minimal" />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-[#A8CBB7]/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-[#A8CBB7] hover:bg-[#F7E6C3]/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回
            </Button>
            <h2 className="text-[#2d3436]">數據分析</h2>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          {loading ? (
            // Loading state
            <div className="col-span-3 flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#A8CBB7] animate-spin" />
              <span className="ml-3 text-[#636e72]">載入統計資料中...</span>
            </div>
          ) : (
            [
              {
                icon: Users,
                title: '累積測驗人數',
                value: summary?.totalUsers.toLocaleString() || '0',
                color: 'from-[#A8CBB7] to-[#9fb8a8]'
              },
              {
                icon: Award,
                title: '平均等級',
                value: getAverageGrade(),
                color: 'from-[#E5C17A] to-[#d4b86a]'
              },
              {
                icon: BookOpen,
                title: '最熱門書籍',
                value: summary?.mostPopularBook?.book || '尚無資料',
                color: 'from-[#A8CBB7] to-[#9fb8a8]'
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-[#A8CBB7]/20 overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#636e72] mb-1">{stat.title}</p>
                        <p className="text-[#2d3436]" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                          {stat.value}
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Grade Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-[#A8CBB7]/20">
              <CardHeader>
                <CardTitle className="text-[#2d3436]">等級分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#A8CBB7" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#636e72" />
                    <YAxis stroke="#636e72" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid #A8CBB7',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Book Participation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="border-[#A8CBB7]/20">
              <CardHeader>
                <CardTitle className="text-[#2d3436]">書籍參與比例</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bookParticipation}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {bookParticipation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid #A8CBB7',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Wrong Questions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="border-[#A8CBB7]/20">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">錯題排行榜</CardTitle>
            </CardHeader>
            <CardContent>
              {wrongQuestions.length === 0 ? (
                <div className="text-center py-8 text-[#636e72]">
                  尚無作答記錄
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#A8CBB7]/20">
                      <TableHead>題目</TableHead>
                      <TableHead>書籍</TableHead>
                      <TableHead>答對率</TableHead>
                      <TableHead>作答次數</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wrongQuestions.map((q, index) => (
                      <TableRow key={q.questionId} className="border-[#A8CBB7]/20">
                        <TableCell className="max-w-md">{q.question}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-[#F7E6C3]/50 rounded text-sm">
                            {q.book}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`
                            px-2 py-1 rounded text-sm
                            ${q.correctRate < 60 ? 'bg-red-100 text-red-700' :
                              q.correctRate < 75 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'}
                          `}>
                            {q.correctRate}%
                          </span>
                        </TableCell>
                        <TableCell>{q.totalAnswers}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
