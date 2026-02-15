'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallets } from '@privy-io/react-auth';
import { useBalance } from '@/hooks/useBalance';
import { ALPHA_USD, TEMPO_CHAIN, encodeTransfer, formatUSD, explorerTxUrl, truncateAddress } from '@/lib/tempo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SendTokens({ isOpen, onClose }: Props) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'signing' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { wallets } = useWallets();
  const { balance } = useBalance(wallets[0]?.address);

  const amountNum = parseFloat(amount) || 0;
  const isValid = recipient.startsWith('0x') && recipient.length === 42 && amountNum > 0;

  const handleSend = async () => {
    if (!isValid) return;
    const wallet = wallets[0];
    if (!wallet) { setStatus('error'); setErrorMsg('No wallet found'); return; }

    setStatus('signing');
    setErrorMsg('');
    try {
      await wallet.switchChain(TEMPO_CHAIN.id);
      const provider = await wallet.getEthereumProvider();
      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: wallet.address,
          to: ALPHA_USD,
          data: encodeTransfer(recipient as `0x${string}`, amount),
        }],
      });
      setTxHash(hash as string);
      setStatus('success');
    } catch (err) {
      console.error('Send failed:', err);
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Transaction failed');
    }
  };

  const handleClose = () => {
    setRecipient('');
    setAmount('');
    setStatus('idle');
    setTxHash('');
    setErrorMsg('');
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
            {status === 'success' ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 8 }}
                  className="text-7xl mb-4"
                >
                  💸
                </motion.div>
                <h3 className="text-xl font-black text-gray-900 mb-2">sent!</h3>
                <p className="text-gray-600 mb-1">
                  {formatUSD(amountNum)} to {truncateAddress(recipient)}
                </p>
                {txHash && (
                  <a href={explorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer" className="text-pink-500 text-sm underline">
                    view on Tempo Explorer
                  </a>
                )}
                <button onClick={handleClose} className="mt-6 w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl">
                  nice
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-black text-gray-900">send AlphaUSD</h3>
                  <button onClick={handleClose} className="text-gray-300 hover:text-gray-500 text-xl transition">✕</button>
                </div>

                {balance !== null && (
                  <p className="text-xs text-gray-400 mb-4">
                    available: <span className="font-bold text-gray-600">${parseFloat(balance).toFixed(2)}</span>
                  </p>
                )}

                {/* Recipient */}
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-500 mb-2 block">to address</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 font-mono text-sm placeholder:text-gray-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition"
                    autoFocus
                  />
                </div>

                {/* Amount */}
                <div className="mb-5">
                  <label className="text-sm font-semibold text-gray-500 mb-2 block">amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold">$</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-9 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-lg font-mono font-bold text-gray-900 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[1, 5, 10, 25].map((v) => (
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
                  onClick={handleSend}
                  disabled={!isValid || status === 'signing'}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                    isValid
                      ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white shadow-lg shadow-pink-300/40 active:scale-[0.98]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {status === 'signing' ? 'signing...' : 'send'}
                </button>

                <p className="text-center text-xs text-gray-400 mt-3">instant on Tempo · zero gas fees</p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
