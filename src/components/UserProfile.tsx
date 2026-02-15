'use client';

import { motion } from 'framer-motion';
import { UserProfile as UserProfileType, Badge } from '@/lib/types';
import { formatUSD } from '@/lib/tempo';

const badgeInfo: Record<Badge, { emoji: string; label: string; bg: string }> = {
  oracle: { emoji: '🔮', label: 'Oracle', bg: 'from-purple-400 to-indigo-500' },
  degen: { emoji: '🎲', label: 'Degen', bg: 'from-orange-400 to-red-500' },
  whale: { emoji: '🐋', label: 'Whale', bg: 'from-cyan-400 to-blue-500' },
  streak: { emoji: '🔥', label: 'On Fire', bg: 'from-yellow-400 to-orange-500' },
};

interface Props {
  profile: UserProfileType;
  badges: Badge[];
}

export default function UserProfileView({ profile, badges }: Props) {
  const s = profile.stats;
  const winRate = s.totalBets > 0 ? Math.round((s.wins / s.totalBets) * 100) : 0;

  return (
    <div>
      {badges.length > 0 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {badges.map((b) => (
            <motion.div
              key={b}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r ${badgeInfo[b].bg} rounded-xl text-white shadow-md flex-shrink-0`}
            >
              <span className="text-lg">{badgeInfo[b].emoji}</span>
              <span className="font-bold text-sm">{badgeInfo[b].label}</span>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="win rate" value={`${winRate}%`} sub={`${s.wins}W - ${s.losses}L`} emoji="🎯" />
        <StatCard label="net P&L" value={`${s.netPnL >= 0 ? '+' : ''}${formatUSD(s.netPnL)}`} sub="all time" emoji={s.netPnL >= 0 ? '📈' : '📉'} />
        <StatCard label="win streak" value={s.currentStreak.toString()} sub={`best: ${s.bestStreak}`} emoji="🔥" />
        <StatCard label="volume" value={formatUSD(s.totalVolume)} sub={`${s.totalBets} bets`} emoji="💰" />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, emoji }: { label: string; value: string; sub: string; emoji: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass border border-white/60 rounded-2xl p-4 shadow-sm"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">{emoji}</span>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-black font-mono text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </motion.div>
  );
}
