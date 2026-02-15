'use client';

import { useState, useEffect, useCallback } from 'react';
import { FriendBet, Bet } from '@/lib/types';
import { fetchMyFeedBets, apiSaveFriendBet, apiUpdateFriendBet, fetchBets, apiPlaceBet } from '@/lib/api';

export function useFeedBets(userAddress?: string) {
  const [feedBets, setFeedBets] = useState<FriendBet[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (userAddress) {
      setLoading(true);
      try {
        const bets = await fetchMyFeedBets(userAddress);
        setFeedBets(bets);
      } catch (err) {
        console.error('Failed to fetch feed bets:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [userAddress]);

  useEffect(() => { refresh(); }, [refresh]);

  const createBet = useCallback(async (bet: FriendBet) => {
    await apiSaveFriendBet(bet);
    refresh();
  }, [refresh]);

  const resolveBet = useCallback(async (id: string, outcome: 'yes' | 'no') => {
    await apiUpdateFriendBet(id, { resolved: true, outcome });
    refresh();
  }, [refresh]);

  return { feedBets, loading, createBet, resolveBet, refresh };
}

export function useUserBets(address?: string) {
  const [bets, setBets] = useState<Bet[]>([]);

  useEffect(() => {
    if (!address) return;
    fetchBets(address).then(setBets).catch(console.error);
  }, [address]);

  const placeBet = useCallback(async (bet: Bet) => {
    await apiPlaceBet(bet);
    setBets((prev) => [bet, ...prev]);
  }, []);

  return { bets, placeBet };
}
