'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FriendBet, Bet } from '@/lib/types';
import { formatUSD, encodeBetMemo, encodeTransferWithMemo, ALPHA_USD, explorerTxUrl, TEMPO_CHAIN } from '@/lib/tempo';
import { useWallets } from '@privy-io/react-auth';
import { saveBet, getProfile } from '@/lib/store';
import { useBalance } from '@/hooks/useBalance';
import PieChart from './PieChart';

interface BetModalProps {
  friendBet: FriendBet;
  onClose: () => void;
  onBetPlaced: (bet: Bet) => void;
}

export default function BetModal({ friendBet, onClose, onBetPlaced }: BetModalProps) {
  const [position, setPosition] = useState<'yes' | 'no' | null>(null);
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'signing' | 'confirming' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const { wallets } = useWallets();
  const { balance, loading: balanceLoading } = useBalance(wallets[0]?.address);

  const profile = getProfile();
  const amountNum = parseFloat(amount) || 0;
  const isValid = position && amountNum >= friendBet.minBet;

  const yesBets = friendBet.bets.filter((b) => b.position === 'yes');
  const noBets = friendBet.bets.filter((b) => b.position === 'no');
  const yesTotal = yesBets.reduce((s, b) => s + b.amount, 0);
  const noTotal = noBets.reduce((s, b) => s + b.amount, 0);
  const total = yesTotal + noTotal;
  const yesPct = total > 0 ? Math.round((yesTotal / total) * 100) : 50;

  const handlePlaceBet = async () => {
    if (!isValid || !profile) return;
    const wallet = wallets[0];
    if (!wallet) { setStatus('error'); setErrorMsg('No wallet found'); return; }

    setStatus('signing');
    setErrorMsg('');
    try {
      await wallet.switchChain(TEMPO_CHAIN.id);
      const provider = await wallet.getEthereumProvider();
      const address = wallet.address as `0x${string}`;
      const memo = encodeBetMemo(friendBet.id, position!);
      const recipientAddress = friendBet.creatorAddress as `0x${string}`;
      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: ALPHA_USD,
          data: encodeTransferWithMemo(recipientAddress, amount, memo),
        }],
      });

      const confirmedHash = hash as string;
      setTxHash(confirmedHash);
      setStatus('confirming');

      const bet: Bet = {
        id: `bet-${Date.now()}`,
        marketId: friendBet.id,
        marketType: 'friend',
        bettor: wallet.address || profile.address,
        bettorName: profile.name,
        bettorAvatar: profile.avatar,
        position: position!,
        amount: amountNum,
        timestamp: Date.now(),
        txHash: confirmedHash,
      };
      saveBet(bet);
      onBetPlaced(bet);
      setStatus('success');
    } catch (err) {
      console.error('Transaction failed:', err);
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Transaction failed');
    }
  };

  return (
    <AnimatePresence>
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
          {status === 'success' ? (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 8 }}
                className="text-7xl mb-4"
              >
                🚀
              </motion.div>
              <h3 className="text-xl font-black text-gray-900 mb-2">you&apos;re in!</h3>
              <p className="text-gray-600 mb-1">
                {formatUSD(amountNum)} on{' '}
                <span className={position === 'yes' ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                  {position?.toUpperCase()}
                </span>
              </p>
              {txHash && (
                <a href={explorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer" className="text-pink-500 text-sm underline">
                  view on Tempo Explorer
                </a>
              )}
              <button onClick={onClose} className="mt-6 w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl">
                nice
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-black text-gray-900">make your call</h3>
                <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-xl transition">✕</button>
              </div>

              <p className="text-gray-700 font-semibold mb-1">{friendBet.question}</p>
              <p className="text-xs text-gray-400 mb-4">{friendBet.creatorAvatar} {friendBet.creator}</p>

              {/* Mini pie chart showing current sentiment */}
              {friendBet.bets.length > 0 && (
                <div className="flex items-center justify-center gap-4 mb-4 py-3 bg-gray-50 rounded-2xl">
                  <PieChart yesPercent={yesPct} size={56} strokeWidth={8}>
                    <span className="text-xs font-bold">{yesPct}%</span>
                  </PieChart>
                  <div className="text-xs text-gray-500">
                    <p><span className="text-green-600 font-bold">{yesBets.length}</span> said yes</p>
                    <p><span className="text-red-500 font-bold">{noBets.length}</span> said no</p>
                  </div>
                </div>
              )}

              {/* Position */}
              <div className="flex gap-3 mb-5">
                <button
                  onClick={() => setPosition('yes')}
                  className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all border-2 ${
                    position === 'yes'
                      ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-200'
                      : 'bg-green-50 text-green-700 border-green-200 hover:border-green-400'
                  }`}
                >
                  yes
                </button>
                <button
                  onClick={() => setPosition('no')}
                  className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all border-2 ${
                    position === 'no'
                      ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200'
                      : 'bg-red-50 text-red-600 border-red-200 hover:border-red-400'
                  }`}
                >
                  no
                </button>
              </div>

              {/* Amount */}
              <div className="mb-5">
                <label className="text-sm font-semibold text-gray-500 mb-2 block">how much?</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold">$</span>
                  <input
                    type="number"
                    min={friendBet.minBet}
                    step="0.5"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={friendBet.minBet.toString()}
                    className="w-full pl-9 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-lg font-mono font-bold text-gray-900 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 5, 10].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmount(v.toString())}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                        amount === v.toString()
                          ? 'bg-pink-100 text-pink-600 ring-2 ring-pink-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-pink-50'
                      }`}
                    >
                      ${v}
                    </button>
                  ))}
                </div>
              </div>

              {status === 'error' && errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-semibold">transaction failed</p>
                  <p className="text-xs text-red-500 mt-0.5">{errorMsg}</p>
                </div>
              )}

              <button
                onClick={handlePlaceBet}
                disabled={!isValid || status === 'signing' || status === 'confirming'}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                  isValid
                    ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white shadow-lg shadow-pink-300/40 active:scale-[0.98]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {status === 'signing' ? 'signing...' : status === 'confirming' ? 'confirming...' : 'lock it in 🔒'}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                {balanceLoading ? 'loading balance...' : balance !== null ? `balance: $${parseFloat(balance).toFixed(2)} AlphaUSD` : ''} · instant on Tempo
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
