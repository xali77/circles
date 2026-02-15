'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/lib/types';
import { saveProfile } from '@/lib/store';
import EmojiPicker from './EmojiPicker';

interface Props {
  address: string;
  onComplete: (profile: UserProfile) => void;
}

export default function ProfileSetup({ address, onComplete }: Props) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('😎');
  const [step, setStep] = useState<1 | 2>(1);

  const handleFinish = () => {
    if (!name.trim()) return;
    const profile: UserProfile = {
      address,
      name: name.trim(),
      avatar,
      stats: { totalBets: 0, wins: 0, losses: 0, pending: 0, netPnL: 0, currentStreak: 0, bestStreak: 0, totalVolume: 0 },
      createdAt: Date.now(),
    };
    saveProfile(profile);
    onComplete(profile);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        {step === 1 ? (
          <>
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 8 }}
              className="text-7xl mb-6"
            >
              👋
            </motion.div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">hey there!</h2>
            <p className="text-gray-500 text-sm mb-8">what should your friends call you?</p>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="your name"
              maxLength={20}
              className="w-full px-5 py-4 text-center text-xl font-bold border-2 border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-300 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(2)}
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => name.trim() && setStep(2)}
              disabled={!name.trim()}
              className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all ${
                name.trim()
                  ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white shadow-lg shadow-pink-300/40'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              next
            </motion.button>
          </>
        ) : (
          <motion.div key="avatar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <motion.span
              key={avatar}
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 8 }}
              className="text-7xl inline-block mb-4"
            >
              {avatar}
            </motion.span>
            <h2 className="text-3xl font-black text-gray-900 mb-2">pick your vibe</h2>
            <p className="text-gray-500 text-sm mb-6">this is you in your circle</p>

            <div className="mb-8">
              <EmojiPicker selected={avatar} onSelect={setAvatar} />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-2xl font-bold text-gray-600 glass border border-white/60 hover:bg-white/80 transition"
              >
                back
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFinish}
                className="flex-[2] py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white shadow-lg shadow-pink-300/40"
              >
                let&apos;s gooo 🚀
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
