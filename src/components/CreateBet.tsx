'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FriendBet, Circle } from '@/lib/types';
import { getProfile } from '@/lib/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (bet: FriendBet) => void;
  circles: Circle[];
}

export default function CreateBet({ isOpen, onClose, onCreate, circles }: Props) {
  const [question, setQuestion] = useState('');
  const [days, setDays] = useState('1');
  const [minBet, setMinBet] = useState('1');
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(circles[0] || null);

  const profile = getProfile();

  const handleCreate = () => {
    if (!question.trim() || !profile || !selectedCircle) return;
    const bet: FriendBet = {
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      question: question.trim(),
      creator: profile.name,
      creatorAddress: profile.address,
      creatorAvatar: profile.avatar,
      circleId: selectedCircle.id,
      circleName: selectedCircle.name,
      circleEmoji: selectedCircle.emoji,
      deadline: Date.now() + parseInt(days) * 86400000,
      minBet: parseFloat(minBet) || 1,
      resolved: false,
      totalPool: 0,
      bets: [],
      createdAt: Date.now(),
    };
    onCreate(bet);
    setQuestion('');
    setDays('1');
    setMinBet('1');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-gray-900 mb-1">new prediction</h3>
            <p className="text-gray-400 text-sm mb-5">drop a bet in your circle</p>

            <div className="space-y-4">
              {/* Circle selector */}
              <div>
                <label className="text-sm font-semibold text-gray-500 mb-2 block">which circle?</label>
                {circles.length === 0 ? (
                  <p className="text-sm text-red-400 bg-red-50 p-3 rounded-xl">
                    you need to create or join a circle first!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {circles.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCircle(c)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                          selectedCircle?.id === c.id
                            ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-pink-300'
                        }`}
                      >
                        <span>{c.emoji}</span>
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Question */}
              <div>
                <label className="text-sm font-semibold text-gray-500 mb-1 block">what&apos;s the bet?</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="will it rain this weekend?"
                  rows={2}
                  maxLength={200}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition resize-none"
                />
                <p className="text-right text-xs text-gray-300 mt-0.5">{question.length}/200</p>
              </div>

              {/* Deadline */}
              <div>
                <label className="text-sm font-semibold text-gray-500 mb-2 block">deadline</label>
                <div className="flex gap-2">
                  {['1', '3', '7', '14'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDays(d)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                        days === d
                          ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Min Bet */}
              <div>
                <label className="text-sm font-semibold text-gray-500 mb-2 block">minimum bet</label>
                <div className="flex gap-2">
                  {['0.5', '1', '2', '5'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMinBet(m)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                        minBet === m
                          ? 'bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-200'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      ${m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={!question.trim() || !selectedCircle}
              className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all ${
                question.trim() && selectedCircle
                  ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white shadow-lg shadow-pink-300/40 active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              drop it 🎯
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
