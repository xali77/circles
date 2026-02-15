'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Circle } from '@/lib/types';

interface Props {
  circles: Circle[];
  currentAddress: string;
  onShare: (circle: Circle) => void;
}

export default function CircleList({ circles, currentAddress, onShare }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (circle: Circle) => {
    navigator.clipboard.writeText(circle.inviteCode);
    setCopiedId(circle.id);
    setTimeout(() => setCopiedId(null), 2000);
    onShare(circle);
  };

  if (circles.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-5xl mb-3">🫧</p>
        <p className="font-bold text-gray-700 text-lg">no circles yet</p>
        <p className="text-sm text-gray-400">create one or join with an invite code!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {circles.map((circle, i) => (
        <motion.div
          key={circle.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass rounded-2xl p-4 border border-white/60 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{circle.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-black text-gray-900 text-base">{circle.name}</p>
              <p className="text-xs text-gray-400">{circle.members.length} member{circle.members.length !== 1 ? 's' : ''}</p>
            </div>
            {circle.creatorAddress === currentAddress && (
              <span className="text-[10px] font-bold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">creator</span>
            )}
          </div>

          {/* Members */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex -space-x-1.5">
              {circle.members.slice(0, 5).map((m) => (
                <span key={m.address} className="text-sm bg-white rounded-full w-6 h-6 flex items-center justify-center border border-gray-200 shadow-sm">
                  {m.avatar}
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-400 ml-1">
              {circle.members.map((m) => m.address === currentAddress ? 'you' : m.name).slice(0, 3).join(', ')}
              {circle.members.length > 3 ? ` +${circle.members.length - 3}` : ''}
            </span>
          </div>

          {/* Invite */}
          <button
            onClick={() => handleCopy(circle)}
            className="w-full flex items-center justify-center gap-2 py-2.5 glass rounded-xl border border-pink-200 hover:border-pink-400 transition active:scale-[0.98]"
          >
            <span className="font-mono font-bold text-pink-600 text-sm tracking-wider">{circle.inviteCode}</span>
            <span className="text-xs text-pink-400">{copiedId === circle.id ? '✅ copied!' : '· tap to copy'}</span>
          </button>
        </motion.div>
      ))}
    </div>
  );
}
