'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCircleByInviteCode, joinCircle, getProfile } from '@/lib/store';
import { Circle } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onJoined: (circle: Circle) => void;
  initialCode?: string;
}

export default function JoinCircle({ isOpen, onClose, onJoined, initialCode = '' }: Props) {
  const [code, setCode] = useState(initialCode);
  const [found, setFound] = useState<Circle | null>(null);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);

  const handleSearch = () => {
    setError('');
    setFound(null);
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    const circle = getCircleByInviteCode(trimmed);
    if (!circle) {
      setError('no circle found with that code');
      return;
    }

    const profile = getProfile();
    if (profile && circle.members.some((m) => m.address === profile.address)) {
      setError("you're already in this circle!");
      return;
    }

    setFound(circle);
  };

  const handleJoin = () => {
    if (!found) return;
    const profile = getProfile();
    if (!profile) return;

    const success = joinCircle(found.id, {
      address: profile.address,
      name: profile.name,
      avatar: profile.avatar,
      joinedAt: Date.now(),
    });

    if (success) {
      setJoined(true);
      onJoined(found);
    }
  };

  const handleClose = () => {
    setCode('');
    setFound(null);
    setError('');
    setJoined(false);
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
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {joined && found ? (
              <div className="text-center py-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 8 }} className="text-7xl mb-3">
                  {found.emoji}
                </motion.div>
                <h3 className="text-xl font-black text-gray-900 mb-1">you&apos;re in!</h3>
                <p className="text-gray-500">
                  welcome to <strong>{found.name}</strong>
                </p>
                <p className="text-sm text-gray-400 mt-1">{found.members.length} member{found.members.length !== 1 ? 's' : ''}</p>
                <button onClick={handleClose} className="mt-6 w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl">
                  nice
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-black text-gray-900 mb-1">join a circle</h3>
                <p className="text-gray-400 text-sm mb-5">enter the invite code</p>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setError(''); setFound(null); }}
                    placeholder="ABC123"
                    maxLength={6}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 font-mono font-bold text-center text-xl uppercase tracking-widest placeholder:text-gray-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={!code.trim()}
                    className={`px-5 py-3 rounded-xl font-bold transition-all ${
                      code.trim() ? 'bg-pink-500 text-white hover:bg-pink-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    find
                  </button>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 mb-4 bg-red-50 p-3 rounded-xl">
                    {error}
                  </motion.p>
                )}

                {found && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 border border-pink-200 text-center">
                    <span className="text-5xl inline-block mb-2">{found.emoji}</span>
                    <p className="font-black text-gray-900 text-xl">{found.name}</p>
                    <p className="text-sm text-gray-400 mb-1">{found.members.length} member{found.members.length !== 1 ? 's' : ''}</p>

                    {/* Member avatars */}
                    <div className="flex justify-center -space-x-2 mb-4 mt-2">
                      {found.members.slice(0, 6).map((m) => (
                        <span key={m.address} className="text-lg bg-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-sm">
                          {m.avatar}
                        </span>
                      ))}
                      {found.members.length > 6 && (
                        <span className="text-xs bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center border-2 border-white font-bold text-gray-500">
                          +{found.members.length - 6}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={handleJoin}
                      className="w-full py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white font-bold rounded-xl shadow-md shadow-pink-200/50 active:scale-[0.98] transition"
                    >
                      join circle
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
