'use client';

import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeedBets, useUserBets } from '@/hooks/useBets';
import PredictionCard from '@/components/PredictionCard';
import BetModal from '@/components/BetModal';
import CreateBet from '@/components/CreateBet';
import ResolveBet from '@/components/ResolveBet';
import ProfileSetup from '@/components/ProfileSetup';
import CreateCircle from '@/components/CreateCircle';
import JoinCircle from '@/components/JoinCircle';
import { FriendBet, UserProfile, Circle } from '@/lib/types';
import { getProfile } from '@/lib/store';
import { fetchMyCircles } from '@/lib/api';
import { useBalance } from '@/hooks/useBalance';

export default function FeedPage() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();

  const [selectedBet, setSelectedBet] = useState<FriendBet | null>(null);
  const [resolvingBet, setResolvingBet] = useState<FriendBet | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [showJoinCircle, setShowJoinCircle] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [circles, setCircles] = useState<Circle[]>([]);

  const address = wallets[0]?.address;
  const { feedBets, createBet, resolveBet, refresh: refreshBets } = useFeedBets(address);
  const { placeBet } = useUserBets(address);
  const { balance, loading: balanceLoading } = useBalance(address);

  useEffect(() => {
    if (ready && !authenticated) router.push('/');
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (address) {
      const existing = getProfile();
      if (existing && existing.address === address) {
        setProfile(existing);
        fetchMyCircles(address).then(setCircles).catch(console.error);
      } else {
        setNeedsSetup(true);
      }
    }
  }, [address]);

  const refreshCircles = () => {
    if (address) fetchMyCircles(address).then(setCircles).catch(console.error);
  };

  if (!ready || !authenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-4xl">🎯</motion.div>
      </div>
    );
  }

  if (needsSetup && address) {
    return <ProfileSetup address={address} onComplete={(p) => { setProfile(p); setNeedsSetup(false); }} />;
  }

  if (!profile) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-4xl">🎯</motion.div>
      </div>
    );
  }

  const hasCircles = circles.length > 0;

  return (
    <div className="min-h-dvh max-w-lg mx-auto pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/40 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.span className="text-3xl" whileTap={{ scale: 1.2, rotate: 15 }}>
              {profile.avatar}
            </motion.span>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">circles</h1>
              <p className="text-[11px] text-gray-500 font-medium">
                {profile.name} · {circles.length} circle{circles.length !== 1 ? 's' : ''}
                {!balanceLoading && balance !== null && (
                  <span className="text-pink-500 font-bold"> · ${parseFloat(balance).toFixed(2)}</span>
                )}
              </p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/profile')}
            className="w-10 h-10 glass rounded-full flex items-center justify-center text-lg border border-white/60 shadow-sm"
          >
            ⚙️
          </motion.button>
        </div>

        {/* Circle pills (horizontal scroll) */}
        {hasCircles && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
            {circles.map((c) => (
              <span key={c.id} className="flex items-center gap-1 px-3 py-1.5 glass rounded-full text-xs font-bold text-gray-700 border border-white/60 whitespace-nowrap flex-shrink-0">
                {c.emoji} {c.name}
                <span className="text-gray-400">({c.members.length})</span>
              </span>
            ))}
          </div>
        )}
      </header>

      {/* No circles empty state */}
      {!hasCircles && (
        <div className="px-4 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-6 border border-white/60 shadow-md text-center"
          >
            <p className="text-5xl mb-3">🫧</p>
            <h3 className="font-black text-gray-900 text-xl mb-2">start a circle</h3>
            <p className="text-sm text-gray-500 mb-5">
              create a circle for your group and share the invite code
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateCircle(true)}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm rounded-xl shadow-md shadow-pink-200/50 active:scale-95 transition"
              >
                create circle
              </button>
              <button
                onClick={() => setShowJoinCircle(true)}
                className="flex-1 py-3 glass text-pink-600 font-bold text-sm rounded-xl border border-pink-200 hover:bg-pink-50 transition active:scale-95"
              >
                join circle
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Feed */}
      <main className="px-4 mt-4 space-y-4">
        <AnimatePresence>
          {feedBets.map((fb, i) => (
            <motion.div key={fb.id} transition={{ delay: i * 0.05 }}>
              <PredictionCard
                bet={fb}
                onBet={(b) => setSelectedBet(b)}
                onResolve={(b) => setResolvingBet(b)}
                isCreator={fb.creatorAddress === address}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {feedBets.length === 0 && hasCircles && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <p className="text-5xl mb-3">🎯</p>
            <p className="font-bold text-gray-700 text-lg">no predictions yet</p>
            <p className="text-sm text-gray-400 mt-1">tap + to create the first one!</p>
          </motion.div>
        )}
      </main>

      {/* Bottom bar — just the + button */}
      <nav className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-2 z-40 pointer-events-none">
        <div className="max-w-lg mx-auto flex justify-center">
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              if (!hasCircles) {
                setShowCreateCircle(true);
              } else {
                setShowCreate(true);
              }
            }}
            className="w-16 h-16 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl shadow-xl shadow-pink-400/40 active:scale-90 transition ring-4 ring-[#fce4ec] pointer-events-auto"
          >
            +
          </motion.button>
        </div>
      </nav>

      {/* Modals */}
      {selectedBet && (
        <BetModal
          friendBet={selectedBet}
          onClose={() => setSelectedBet(null)}
          onBetPlaced={(bet) => { placeBet(bet).then(() => refreshBets()); setSelectedBet(null); }}
        />
      )}

      <CreateBet
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(bet) => { createBet(bet); }}
        circles={circles}
      />

      {resolvingBet && (
        <ResolveBet
          bet={resolvingBet}
          onClose={() => setResolvingBet(null)}
          onResolved={(id, outcome) => { resolveBet(id, outcome); setResolvingBet(null); }}
        />
      )}

      <CreateCircle
        isOpen={showCreateCircle}
        onClose={() => setShowCreateCircle(false)}
        onCreated={(c) => { refreshCircles(); refreshBets(); }}
      />

      <JoinCircle
        isOpen={showJoinCircle}
        onClose={() => setShowJoinCircle(false)}
        onJoined={(c) => { refreshCircles(); refreshBets(); }}
      />
    </div>
  );
}
