import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { NatureAccents } from '../components/NatureAccents';
import { Lock, User, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { login } from '../services/authService';

interface AdminLoginProps {
  onLogin: (username: string) => void;
  onBack: () => void;
}

export function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ username, password });

      // Call parent onLogin with username
      onLogin(response.admin.username);
    } catch (err: any) {
      console.error('Login error:', err);

      // Extract error message
      let errorMessage = '登入失敗，請稍後再試';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF7] to-[#A8CBB7]/10 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Nature Accents */}
      <NatureAccents variant="minimal" />

      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-[#A8CBB7] hover:bg-[#F7E6C3]/20"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回首頁
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl border-2 border-[#A8CBB7]/30">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#A8CBB7] to-[#9fb8a8] rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-[#2d3436]">管理員登入</h2>
            <p className="text-[#636e72] text-sm mt-2">醫療靈媒隨堂測驗後台</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#2d3436]">帳號</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#636e72]" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 border-[#A8CBB7]/30 focus:border-[#A8CBB7] focus:ring-[#A8CBB7]"
                  placeholder="請輸入帳號"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#2d3436]">密碼</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#636e72]" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-[#A8CBB7]/30 focus:border-[#A8CBB7] focus:ring-[#A8CBB7]"
                  placeholder="請輸入密碼"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="
                w-full
                bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8]
                text-white py-6 rounded-xl
                hover:shadow-lg hover:shadow-[#A8CBB7]/30
                transition-all duration-300
                relative overflow-hidden
                group
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="relative z-10">登入中...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">登入</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="
                w-full
                border-[#A8CBB7] text-[#A8CBB7]
                hover:bg-[#F7E6C3]/20
                py-6 rounded-xl
                transition-all duration-300
              "
              disabled={loading}
            >
              返回首頁
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
