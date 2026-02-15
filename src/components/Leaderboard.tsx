'use client';

import { motion } from 'framer-motion';
import { LeaderboardEntry, Badge } from '@/lib/types';
import { formatUSD } from '@/lib/tempo';
import PieChart from './PieChart';

const badgeInfo: Record<Badge, { emoji: string; label: string; color: string }> = {
  oracle: { emoji: '🔮', label: 'Oracle', color: 'bg-purple-100 text-purple-700' },
  degen: { emoji: '🎲', label: 'Degen', color: 'bg-orange-100 text-orange-700' },
  whale: { emoji: '🐋', label: 'Whale', color: 'bg-blue-100 text-blue-700' },
  streak: { emoji: '🔥', label: 'On Fire', color: 'bg-red-100 text-red-700' },
};

const podiumColors = ['from-yellow-400 to-amber-500', 'from-gray-300 to-gray-400', 'from-orange-400 to-orange-600'];
const podiumEmoji = ['👑', '🥈', '🥉'];

interface Props {
  entries: LeaderboardEntry[];
  currentAddress?: string;
}

export default function Leaderboard({ entries, currentAddress }: Props) {
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-5xl mb-3">🏆</p>
        <p className="font-bold text-gray-700 text-lg">no one here yet</p>
        <p className="text-sm text-gray-400">add friends and start predicting!</p>
      </div>
    );
  }

  return (
    <div>
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-3 mb-8 px-2">
          {[1, 0, 2].map((podiumIdx) => {
            const entry = top3[podiumIdx];
            if (!entry) return <div key={podiumIdx} className="flex-1" />;
            const isFirst = podiumIdx === 0;
            const winRate = entry.stats.totalBets > 0 ? Math.round((entry.stats.wins / entry.stats.totalBets) * 100) : 0;
            const isYou = entry.address === currentAddress;

            return (
              <motion.div
                key={entry.address}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: podiumIdx * 0.15 }}
                className={`flex-1 text-center ${isFirst ? 'order-2' : podiumIdx === 1 ? 'order-1' : 'order-3'}`}
              >
                <div className="text-2xl mb-1">{podiumEmoji[podiumIdx]}</div>
                <div className={`bg-gradient-to-b ${podiumColors[podiumIdx]} rounded-2xl ${isFirst ? 'pt-5 pb-4' : 'pt-4 pb-3'} px-2 shadow-md`}>
                  <div className="text-3xl mb-1">{entry.avatar}</div>
                  <p className="font-bold text-white text-sm truncate">{isYou ? 'you' : entry.name}</p>
                  <p className="text-white/80 text-xs font-mono">{winRate}%</p>
                  <p className="text-white font-bold font-mono text-sm">
                    {entry.stats.netPnL >= 0 ? '+' : ''}{formatUSD(entry.stats.netPnL)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="space-y-2">
        {rest.map((entry, i) => {
          const winRate = entry.stats.totalBets > 0 ? Math.round((entry.stats.wins / entry.stats.totalBets) * 100) : 0;
          const isYou = entry.address === currentAddress;

          return (
            <motion.div
              key={entry.address}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                isYou ? 'glass border-2 border-pink-200 shadow-sm' : 'glass border border-white/60'
              }`}
            >
              <span className="text-lg font-black text-gray-400 w-8 text-center font-mono">{entry.rank}</span>
              <span className="text-2xl">{entry.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">{isYou ? 'you' : entry.name}</p>
                <div className="flex gap-1 mt-0.5">
                  {entry.badges.map((b) => (
                    <span key={b} className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${badgeInfo[b].color}`}>
                      {badgeInfo[b].emoji} {badgeInfo[b].label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="font-black font-mono text-sm text-gray-900">{winRate}%</p>
                <p className={`text-xs font-mono font-bold ${entry.stats.netPnL >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {entry.stats.netPnL >= 0 ? '+' : ''}{formatUSD(entry.stats.netPnL)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
