'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePrivy, useWallets, useExportWallet } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import UserProfileView from '@/components/UserProfile';
import Leaderboard from '@/components/Leaderboard';
import CircleList from '@/components/CircleList';
import CreateCircle from '@/components/CreateCircle';
import JoinCircle from '@/components/JoinCircle';
import SendTokens from '@/components/SendTokens';
import { getProfile, saveProfile } from '@/lib/store';
import { fetchMyCircles, fetchCircleLeaderboard } from '@/lib/api';
import { UserProfile, LeaderboardEntry, Badge, Circle } from '@/lib/types';
import { useBalance } from '@/hooks/useBalance';
import { truncateAddress, explorerAddressUrl } from '@/lib/tempo';
import EmojiPicker from '@/components/EmojiPicker';

function getBadges(p: UserProfile): Badge[] {
  const s = p.stats;
  const b: Badge[] = [];
  if (s.totalBets >= 20 && s.wins / s.totalBets >= 0.8) b.push('oracle');
  if (s.totalBets >= 15) b.push('degen');
  if (s.totalVolume >= 100) b.push('whale');
  if (s.currentStreak >= 5) b.push('streak');
  return b;
}

export default function ProfilePage() {
  const { ready, authenticated, logout } = usePrivy();
  const { wallets } = useWallets();
  const { exportWallet } = useExportWallet();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'leaderboard' | 'circles'>('stats');
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [showJoinCircle, setShowJoinCircle] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [newName, setNewName] = useState('');

  const address = wallets[0]?.address;
  const { balance, loading: balanceLoading } = useBalance(address);
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (ready && !authenticated) router.push('/'); }, [ready, authenticated, router]);

  const refreshData = useCallback(async () => {
    if (address) {
      const p = getProfile();
      if (p) {
        setProfile(p);
        const myCircles = await fetchMyCircles(address);
        setCircles(myCircles);
        if (myCircles.length > 0) {
          const cId = selectedCircleId || myCircles[0].id;
          setSelectedCircleId(cId);
          const lb = await fetchCircleLeaderboard(cId);
          setLeaderboard(lb);
        }
      }
    }
  }, [address, selectedCircleId]);

  useEffect(() => { refreshData(); }, [refreshData]);

  const handleUpdateName = () => {
    if (profile && newName.trim()) {
      const updated = { ...profile, name: newName.trim() };
      saveProfile(updated); setProfile(updated); setEditingName(false);
    }
  };

  const handleUpdateAvatar = (emoji: string) => {
    if (profile) {
      const updated = { ...profile, avatar: emoji };
      saveProfile(updated); setProfile(updated); setEditingAvatar(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-4xl">🏆</motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh max-w-lg mx-auto px-4 pb-8">
      <header className="pt-4 pb-3 flex items-center justify-between">
        <button onClick={() => router.push('/feed')} className="text-gray-500 hover:text-gray-700 font-semibold text-sm">← feed</button>
        <h1 className="text-lg font-black text-gray-900">profile</h1>
        <button onClick={logout} className="text-xs text-gray-400 hover:text-red-500 font-semibold transition">log out</button>
      </header>

      {/* Avatar & Name */}
      <div className="text-center mb-4">
        <button onClick={() => setEditingAvatar(!editingAvatar)} className="relative inline-block">
          <motion.div whileTap={{ scale: 0.9, rotate: 10 }} className="w-24 h-24 mx-auto glass rounded-full flex items-center justify-center text-5xl shadow-lg border-4 border-white mb-3">
            {profile.avatar}
          </motion.div>
          <span className="absolute bottom-2 right-0 bg-white rounded-full w-7 h-7 flex items-center justify-center text-xs shadow-md border border-gray-200">✏️</span>
        </button>

        {editingAvatar && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm mx-auto mb-4 glass p-4 rounded-2xl shadow-lg border border-white/60">
            <EmojiPicker selected={profile.avatar} onSelect={handleUpdateAvatar} />
          </motion.div>
        )}

        {editingName ? (
          <div className="flex items-center justify-center gap-2 mb-1">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={20}
              className="px-3 py-1.5 border-2 border-pink-300 rounded-xl text-center font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-200"
              autoFocus onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()} />
            <button onClick={handleUpdateName} className="text-pink-500 font-bold text-sm">save</button>
            <button onClick={() => setEditingName(false)} className="text-gray-400 text-sm">✕</button>
          </div>
        ) : (
          <button onClick={() => { setNewName(profile.name); setEditingName(true); }} className="group">
            <h2 className="text-2xl font-black text-gray-900 inline-flex items-center gap-1">
              {profile.name}
              <span className="text-gray-300 group-hover:text-pink-400 text-sm transition">✏️</span>
            </h2>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex glass rounded-2xl p-1 mb-6 border border-white/60">
        {(['stats', 'leaderboard', 'circles'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`relative flex-1 py-2.5 text-xs font-bold text-center rounded-xl transition-colors z-10 ${activeTab === t ? 'text-gray-900' : 'text-gray-400'}`}
          >
            {activeTab === t && (
              <motion.div layoutId="profileTab" className="absolute inset-0 bg-white rounded-xl shadow-sm" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
            )}
            <span className="relative z-10">
              {t === 'stats' ? '📊 stats' : t === 'leaderboard' ? '🏆 ranks' : `🫧 circles (${circles.length})`}
            </span>
          </button>
        ))}
      </div>

      {activeTab === 'stats' && <UserProfileView profile={profile} badges={getBadges(profile)} />}

      {activeTab === 'leaderboard' && (
        <>
          {circles.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {circles.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCircleId(c.id); fetchCircleLeaderboard(c.id).then(setLeaderboard); }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedCircleId === c.id
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'glass text-gray-600 border-white/60 hover:border-pink-300'
                  }`}
                >
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
          )}
          <Leaderboard entries={leaderboard} currentAddress={address} />
        </>
      )}

      {activeTab === 'circles' && (
        <>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setShowCreateCircle(true)} className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm rounded-xl shadow-md shadow-pink-200/50 active:scale-[0.98] transition">
              create circle
            </button>
            <button onClick={() => setShowJoinCircle(true)} className="flex-1 py-3 glass text-pink-600 font-bold text-sm rounded-xl border border-pink-200 hover:bg-pink-50 transition active:scale-[0.98]">
              join circle
            </button>
          </div>
          <CircleList circles={circles} currentAddress={address || ''} onShare={() => {}} />
        </>
      )}

      {/* Wallet info */}
      {address && (
        <div className="mt-8 glass rounded-2xl p-5 border border-white/60">
          <p className="text-sm font-black text-gray-700 mb-3">wallet</p>

          {/* Balance */}
          <div className="text-center mb-4">
            <p className="text-3xl font-black text-gray-900">
              {balanceLoading ? '...' : balance !== null ? `$${parseFloat(balance).toFixed(2)}` : '$0.00'}
            </p>
            <p className="text-xs text-gray-400 font-medium">AlphaUSD balance</p>
          </div>

          {/* Address */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(address);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="w-full py-2.5 px-4 glass rounded-xl border border-white/60 flex items-center justify-between mb-3 hover:bg-white/50 transition"
          >
            <span className="text-sm font-mono text-gray-600">{truncateAddress(address)}</span>
            <span className="text-xs text-gray-400">{copied ? 'copied!' : 'tap to copy'}</span>
          </button>

          {/* Actions */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setShowSend(true)}
              className="flex-1 py-2.5 text-center text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl shadow-md shadow-pink-200/50 active:scale-[0.98] transition"
            >
              send
            </button>
            <a
              href={explorerAddressUrl(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 text-center text-sm font-bold text-pink-600 glass rounded-xl border border-pink-200 hover:bg-pink-50 transition"
            >
              explorer
            </a>
            {!balanceLoading && balance !== null && parseFloat(balance) === 0 && (
              <a
                href="https://faucet.tempo.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 text-center text-sm font-bold text-pink-600 glass rounded-xl border border-pink-200 hover:bg-pink-50 transition"
              >
                faucet
              </a>
            )}
          </div>
          <button
            onClick={exportWallet}
            className="w-full py-2.5 text-center text-sm font-bold text-gray-600 glass rounded-xl border border-gray-200 hover:bg-gray-50 transition"
          >
            export private key
          </button>
        </div>
      )}

      {/* Tempo info */}
      <div className="mt-4 glass rounded-2xl p-4 border border-white/60">
        <p className="text-sm font-black text-pink-600 mb-1">powered by Tempo</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>⚡ instant finality — bets confirm in seconds</li>
          <li>🆓 fee sponsorship — zero gas costs</li>
          <li>💸 stablecoin-native — no volatile crypto</li>
          <li>📝 memo tracking — every bet on-chain</li>
          <li>🔄 batch payouts — winners paid atomically</li>
        </ul>
      </div>

      <CreateCircle isOpen={showCreateCircle} onClose={() => setShowCreateCircle(false)} onCreated={() => refreshData()} />
      <JoinCircle isOpen={showJoinCircle} onClose={() => setShowJoinCircle(false)} onJoined={() => refreshData()} />
      <SendTokens isOpen={showSend} onClose={() => setShowSend(false)} />
    </div>
  );
}
