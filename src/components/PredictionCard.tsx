'use client';

import { motion } from 'framer-motion';
import { FriendBet } from '@/lib/types';
import { formatUSD } from '@/lib/tempo';
import PieChart from './PieChart';

interface Props {
  bet: FriendBet;
  onBet: (bet: FriendBet) => void;
  onResolve?: (bet: FriendBet) => void;
  isCreator?: boolean;
}

export default function PredictionCard({ bet, onBet, onResolve, isCreator }: Props) {
  const now = Date.now();
  const isExpired = now > bet.deadline;
  const timeLeft = bet.deadline - now;
  const hoursLeft = Math.max(0, Math.floor(timeLeft / 3600000));
  const daysLeft = Math.floor(hoursLeft / 24);
  const minsLeft = Math.max(0, Math.floor(timeLeft / 60000));

  const timeStr = daysLeft > 0
    ? `${daysLeft}d ${hoursLeft % 24}h`
    : hoursLeft > 0
    ? `${hoursLeft}h ${Math.floor((timeLeft % 3600000) / 60000)}m`
    : minsLeft > 0
    ? `${minsLeft}m`
    : 'Ended';

  // Calculate yes/no distribution
  const yesTotal = bet.bets.filter((b) => b.position === 'yes').reduce((s, b) => s + b.amount, 0);
  const noTotal = bet.bets.filter((b) => b.position === 'no').reduce((s, b) => s + b.amount, 0);
  const total = yesTotal + noTotal;
  const yesPct = total > 0 ? Math.round((yesTotal / total) * 100) : 50;
  const totalBettors = new Set(bet.bets.map((b) => b.bettor)).size;

  // Fun emoji based on pool size
  const poolEmoji = bet.totalPool >= 50 ? '🔥' : bet.totalPool >= 20 ? '⚡' : bet.totalPool >= 5 ? '✨' : '🌱';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="glass rounded-3xl p-5 shadow-lg shadow-pink-200/30 border border-white/60 cursor-pointer hover:shadow-xl hover:shadow-pink-200/40 transition-shadow"
      onClick={() => !bet.resolved && !isExpired && onBet(bet)}
    >
      {/* Top row: circle + creator + time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{bet.circleEmoji} {bet.circleName}</span>
          <span className="text-gray-300">·</span>
          <span className="text-xl">{bet.creatorAvatar}</span>
          <span className="text-sm font-semibold text-gray-600">{bet.creator}</span>
        </div>
        {bet.resolved ? (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
            {bet.outcome === 'yes' ? '✅' : '❌'} {bet.outcome?.toUpperCase()}
          </span>
        ) : (
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
            isExpired
              ? 'bg-gray-200 text-gray-500'
              : 'bg-pink-100 text-pink-600'
          }`}>
            {isExpired ? '⏰ ' : '🕐 '}{timeStr}
          </span>
        )}
      </div>

      {/* Question */}
      <p className="font-bold text-gray-900 text-[17px] leading-snug mb-4">{bet.question}</p>

      {/* Main content: pie chart + stats */}
      <div className="flex items-center gap-5">
        {/* Pie Chart */}
        <PieChart yesPercent={yesPct} size={88} strokeWidth={12}>
          <div className="text-center">
            <div className="text-lg font-black text-gray-800 font-mono leading-none">{totalBettors}</div>
            <div className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">
              {totalBettors === 1 ? 'player' : 'players'}
            </div>
          </div>
        </PieChart>

        {/* Stats */}
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-gray-700">Yes</span>
            </div>
            <span className="text-sm font-bold font-mono text-gray-800">{yesPct}% · {formatUSD(yesTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm font-semibold text-gray-700">No</span>
            </div>
            <span className="text-sm font-bold font-mono text-gray-800">{100 - yesPct}% · {formatUSD(noTotal)}</span>
          </div>
          <div className="h-px bg-gray-200/60" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">{poolEmoji} Pool</span>
            <span className="text-sm font-black font-mono text-gray-900">{formatUSD(bet.totalPool)}</span>
          </div>
        </div>
      </div>

      {/* Bettor avatars row */}
      {bet.bets.length > 0 && (
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-200/50">
          <div className="flex -space-x-1.5">
            {[...new Map(bet.bets.map((b) => [b.bettor, b])).values()].slice(0, 5).map((b) => (
              <span key={b.bettor} className="text-sm bg-white rounded-full w-6 h-6 flex items-center justify-center border border-gray-200 shadow-sm">
                {b.bettorAvatar}
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-1">
            {totalBettors > 5 ? `+${totalBettors - 5} more` : 'in the pool'}
          </span>
        </div>
      )}

      {/* Resolve button for creator */}
      {isCreator && !bet.resolved && onResolve && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onResolve(bet);
          }}
          className="w-full mt-3 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl text-sm shadow-md shadow-pink-200/50 active:scale-[0.98] transition"
        >
          Resolve This Bet
        </button>
      )}

      {/* CTA */}
      {!bet.resolved && !isExpired && bet.bets.length === 0 && (
        <p className="text-center text-sm font-semibold text-pink-500 mt-3 pt-3 border-t border-gray-200/50">
          Be the first to predict!
        </p>
      )}
    </motion.div>
  );
}
