'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FriendBet } from '@/lib/types';
import { formatUSD, ALPHA_USD, tip20Abi, explorerTxUrl, TEMPO_CHAIN } from '@/lib/tempo';
import { useWallets } from '@privy-io/react-auth';
import { encodeFunctionData, parseUnits } from 'viem';
import PieChart from './PieChart';

interface Props {
  bet: FriendBet | null;
  onClose: () => void;
  onResolved: (id: string, outcome: 'yes' | 'no') => void;
}

export default function ResolveBet({ bet, onClose, onResolved }: Props) {
  const [outcome, setOutcome] = useState<'yes' | 'no' | null>(null);
  const [status, setStatus] = useState<'idle' | 'paying' | 'done'>('idle');
  const [payoutProgress, setPayoutProgress] = useState({ current: 0, total: 0, succeeded: 0 });
  const [txHashes, setTxHashes] = useState<string[]>([]);
  const { wallets } = useWallets();

  if (!bet) return null;

  const yesBettors = bet.bets.filter((b) => b.position === 'yes');
  const noBettors = bet.bets.filter((b) => b.position === 'no');
  const yesTotal = yesBettors.reduce((s, b) => s + b.amount, 0);
  const noTotal = noBettors.reduce((s, b) => s + b.amount, 0);
  const total = yesTotal + noTotal;
  const yesPct = total > 0 ? Math.round((yesTotal / total) * 100) : 50;

  const handleResolve = async () => {
    if (!outcome) return;
    setStatus('paying');

    const winners = outcome === 'yes' ? yesBettors : noBettors;
    const winnersTotal = outcome === 'yes' ? yesTotal : noTotal;

    if (winners.length > 0 && winnersTotal > 0) {
      const wallet = wallets[0];
      if (wallet) {
        await wallet.switchChain(TEMPO_CHAIN.id);
        const provider = await wallet.getEthereumProvider();
        const hashes: string[] = [];
        let succeeded = 0;
        setPayoutProgress({ current: 0, total: winners.length, succeeded: 0 });

        for (let i = 0; i < winners.length; i++) {
          const w = winners[i];
          const share = (w.amount / winnersTotal) * bet.totalPool;
          setPayoutProgress({ current: i + 1, total: winners.length, succeeded });

          try {
            const data = encodeFunctionData({
              abi: tip20Abi,
              functionName: 'transfer',
              args: [w.bettor as `0x${string}`, parseUnits(share.toFixed(6), 6)],
            });
            const hash = await provider.request({
              method: 'eth_sendTransaction',
              params: [{ from: wallet.address, to: ALPHA_USD, data }],
            });
            hashes.push(hash as string);
            succeeded++;
          } catch (err) {
            console.error(`Payout ${i + 1}/${winners.length} failed:`, err);
          }
        }

        setTxHashes(hashes);
        setPayoutProgress({ current: winners.length, total: winners.length, succeeded });
      }
    }

    onResolved(bet.id, outcome);
    setStatus('done');
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
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {status === 'done' ? (
            <div className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-7xl mb-4">💸</motion.div>
              <h3 className="text-xl font-black text-gray-900 mb-2">done deal!</h3>
              <p className="text-gray-600 mb-1">
                outcome: <span className={outcome === 'yes' ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{outcome?.toUpperCase()}</span>
              </p>
              <p className="text-gray-400 text-sm">
                {payoutProgress.succeeded}/{payoutProgress.total} payouts sent via Tempo
              </p>
              {txHashes.length > 0 && (
                <a href={explorerTxUrl(txHashes[0])} target="_blank" rel="noopener noreferrer" className="text-pink-500 text-sm underline mt-2 block">
                  view on Tempo Explorer
                </a>
              )}
              <button onClick={onClose} className="mt-6 w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl">
                nice
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-black text-gray-900 mb-1">resolve this bet</h3>
              <p className="text-gray-600 font-semibold mb-4">{bet.question}</p>

              {/* Pie chart summary */}
              <div className="flex items-center justify-center gap-5 mb-5 py-3 bg-gray-50 rounded-2xl">
                <PieChart yesPercent={yesPct} size={72} strokeWidth={10}>
                  <span className="text-sm font-black font-mono">{formatUSD(bet.totalPool)}</span>
                </PieChart>
                <div className="text-sm space-y-1">
                  <p><span className="text-green-600 font-bold">{yesBettors.length}</span> yes · {formatUSD(yesTotal)}</p>
                  <p><span className="text-red-500 font-bold">{noBettors.length}</span> no · {formatUSD(noTotal)}</p>
                </div>
              </div>

              <p className="text-sm font-semibold text-gray-500 mb-3">what happened?</p>
              <div className="flex gap-3 mb-5">
                <button
                  onClick={() => setOutcome('yes')}
                  className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all border-2 ${
                    outcome === 'yes' ? 'bg-green-500 text-white border-green-500' : 'bg-green-50 text-green-700 border-green-200'
                  }`}
                >
                  yes ✓
                </button>
                <button
                  onClick={() => setOutcome('no')}
                  className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all border-2 ${
                    outcome === 'no' ? 'bg-red-500 text-white border-red-500' : 'bg-red-50 text-red-600 border-red-200'
                  }`}
                >
                  no ✗
                </button>
              </div>

              <button
                onClick={handleResolve}
                disabled={!outcome || status === 'paying'}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                  outcome ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {status === 'paying'
                  ? payoutProgress.total > 0
                    ? `paying ${payoutProgress.current}/${payoutProgress.total}...`
                    : 'paying out...'
                  : 'resolve & pay winners'}
              </button>
              <p className="text-center text-xs text-gray-400 mt-2">atomic batch payout via Tempo</p>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
