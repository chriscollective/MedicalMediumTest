import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trophy, Sparkles, Loader2 } from 'lucide-react';

interface LeaderboardNameDialogProps {
  open: boolean;
  rank: number;
  onSubmit: (displayName: string) => Promise<void>;
  onClose: () => void;
}

export function LeaderboardNameDialog({
  open,
  rank,
  onSubmit,
  onClose,
}: LeaderboardNameDialogProps) {
  const [displayName, setDisplayName] = useState('');
  const [useAnonymous, setUseAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!useAnonymous && displayName.trim() === '') {
      alert('請輸入顯示名稱或選擇匿名');
      return;
    }

    setSubmitting(true);
    try {
      const finalName = useAnonymous ? '匿名勇者' : displayName.trim();
      await onSubmit(finalName);
      onClose();
    } catch (error) {
      console.error('提交榜單失敗:', error);
      alert('提交失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E5C17A] to-[#d4b86a] flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-6 h-6 text-[#E5C17A]" />
              </motion.div>
            </motion.div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-[#2d3436]">
            恭喜上榜！
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            你的成績進入了
            <span className="text-[#E5C17A] font-bold mx-1">TOP {rank}</span>
            榜單！
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium text-[#2d3436]">
              榜單顯示名稱
            </label>
            <Input
              id="displayName"
              placeholder="請輸入你的名稱"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={useAnonymous || submitting}
              maxLength={10}
              className="border-[#A8CBB7]/30 focus:border-[#A8CBB7]"
            />
            <p className="text-xs text-[#636e72]">最多 10 個字元</p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={useAnonymous}
              onChange={(e) => setUseAnonymous(e.target.checked)}
              disabled={submitting}
              className="w-4 h-4 text-[#A8CBB7] border-[#A8CBB7]/30 rounded focus:ring-[#A8CBB7]"
            />
            <label htmlFor="anonymous" className="text-sm text-[#636e72] cursor-pointer">
              使用匿名（顯示為「匿名勇者」）
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="border-[#A8CBB7] text-[#A8CBB7] hover:bg-[#A8CBB7] hover:text-white"
          >
            跳過
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || (!useAnonymous && displayName.trim() === '')}
            className="bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8] hover:opacity-90"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                提交中...
              </>
            ) : (
              '提交榜單'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
