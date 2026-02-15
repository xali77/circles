'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const { login, ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/feed');
    }
  }, [ready, authenticated, router]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center max-w-sm"
      >
        {/* Animated circles logo */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <div className="w-full h-full rounded-full border-4 border-dashed border-pink-300/50" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-3"
          >
            <div className="w-full h-full rounded-full border-4 border-dashed border-purple-300/50" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center text-5xl"
          >
            🎯
          </motion.div>
        </div>

        <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tight">
          Circles
        </h1>
        <p className="text-lg text-gray-600 mb-1 font-semibold">
          predict stuff with your crew
        </p>
        <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto">
          make bets with friends, flex your accuracy, settle up instantly
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { emoji: '⚡', text: 'instant settlement' },
            { emoji: '🆓', text: 'zero gas fees' },
            { emoji: '💸', text: 'real stakes' },
            { emoji: '🏆', text: 'leaderboards' },
          ].map((f, i) => (
            <motion.span
              key={f.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="px-3.5 py-2 glass rounded-full text-xs font-bold text-gray-600 shadow-sm border border-white/60"
            >
              {f.emoji} {f.text}
            </motion.span>
          ))}
        </div>

        {/* Login */}
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={login}
          className="w-full py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-pink-300/40 hover:shadow-xl hover:shadow-pink-300/50 transition-shadow"
        >
          let&apos;s gooo
        </motion.button>

        <p className="text-xs text-gray-400 mt-4">
          sign in with email or phone · no wallet needed
        </p>

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-gray-400">
          <span>powered by</span>
          <span className="font-bold text-pink-400">Tempo</span>
        </div>
      </motion.div>
    </div>
  );
}
