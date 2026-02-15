'use client';

import { useState, useEffect, useCallback } from 'react';
import { FriendBet, Bet } from '@/lib/types';
import { getMyFeedBets, saveFriendBet, saveBet, updateFriendBet, getBets } from '@/lib/store';

export function useFeedBets(userAddress?: string) {
  const [feedBets, setFeedBets] = useState<FriendBet[]>([]);

  const refresh = useCallback(() => {
    if (userAddress) {
      setFeedBets(getMyFeedBets(userAddress));
    }
  }, [userAddress]);

  useEffect(() => { refresh(); }, [refresh]);

  const createBet = useCallback((bet: FriendBet) => {
    saveFriendBet(bet);
    refresh();
  }, [refresh]);

  const resolveBet = useCallback((id: string, outcome: 'yes' | 'no') => {
    updateFriendBet(id, { resolved: true, outcome });
    refresh();
  }, [refresh]);

  return { feedBets, createBet, resolveBet, refresh };
}

export function useUserBets(address?: string) {
  const [bets, setBets] = useState<Bet[]>([]);

  useEffect(() => {
    if (!address) return;
    setBets(getBets().filter((b) => b.bettor === address));
  }, [address]);

  const placeBet = useCallback((bet: Bet) => {
    saveBet(bet);
    setBets((prev) => [bet, ...prev]);
  }, []);

  return { bets, placeBet };
}
