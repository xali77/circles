'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfile, generateInviteCode } from '@/lib/store';
import { apiCreateCircle } from '@/lib/api';
import { Circle } from '@/lib/types';
import EmojiPicker from './EmojiPicker';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (circle: Circle) => void;
}

export default function CreateCircle({ isOpen, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏀');

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    const profile = getProfile();
    if (!name.trim() || !profile || creating) return;
    setCreating(true);
    setError('');
    try {
      const circle: Circle = {
        id: `crc-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        name: name.trim(),
        emoji,
        inviteCode: generateInviteCode(),
        creatorAddress: profile.address,
        members: [{ address: profile.address, name: profile.name, avatar: profile.avatar, joinedAt: Date.now() }],
        createdAt: Date.now(),
      };
      const created = await apiCreateCircle(circle);
      onCreated(created);
      setName('');
      setEmoji('🏀');
      onClose();
    } catch (err) {
      console.error('Failed to create circle:', err);
      setError('failed to create circle — try again');
    } finally {
      setCreating(false);
    }
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
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-gray-900 mb-1">new circle</h3>
            <p className="text-gray-400 text-sm mb-5">create a group for your crew</p>

            {/* Emoji picker */}
            <div className="text-center mb-4">
              <motion.span
                key={emoji}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="text-6xl inline-block"
              >
                {emoji}
              </motion.span>
            </div>
            <div className="mb-5">
              <EmojiPicker selected={emoji} onSelect={setEmoji} />
            </div>

            {/* Name */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="circle name"
              maxLength={30}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 text-lg font-bold placeholder:text-gray-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />

            {error && (
              <p className="text-sm text-red-500 mt-3 bg-red-50 p-3 rounded-xl">{error}</p>
            )}

            <button
              onClick={handleCreate}
              disabled={!name.trim() || creating}
              className={`w-full mt-5 py-4 rounded-2xl font-bold text-lg transition-all ${
                name.trim()
                  ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white shadow-lg shadow-pink-300/40 active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {creating ? 'creating...' : 'create circle'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
