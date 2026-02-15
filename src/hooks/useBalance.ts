'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAlphaBalance } from '@/lib/tempo';

const POLL_INTERVAL = 15_000;

export function useBalance(address: string | undefined) {
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!address) return;
    try {
      const bal = await fetchAlphaBalance(address);
      setBalance(bal);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (!address) {
      setBalance(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh();
    const id = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [address, refresh]);

  return { balance, loading, refresh };
}
