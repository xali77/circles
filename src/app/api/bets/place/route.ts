import { getKV } from '@/lib/kv';
import { NextRequest, NextResponse } from 'next/server';
import { Bet, FriendBet, UserProfile } from '@/lib/types';

// POST /api/bets/place — 3-way update: bets list + friendBet + profile stats
export async function POST(req: NextRequest) {
  const bet: Bet = await req.json();
  const kv = getKV();

  // 1. Add to global bets list
  const bets = await kv.get<Bet[]>('bets') ?? [];
  bets.unshift(bet);
  await kv.set('bets', bets);

  // 2. Update the friend bet (add bet, update pool)
  const friendBets = await kv.get<FriendBet[]>('friendbets') ?? [];
  const fb = friendBets.find((f) => f.id === bet.marketId);
  if (fb) {
    fb.bets.push(bet);
    fb.totalPool += bet.amount;
    await kv.set('friendbets', friendBets);
  }

  // 3. Update bettor's profile stats
  const profile = await kv.get<UserProfile>(`profile:${bet.bettor}`);
  if (profile) {
    profile.stats.totalBets += 1;
    profile.stats.pending += 1;
    profile.stats.totalVolume += bet.amount;
    await kv.set(`profile:${bet.bettor}`, profile);
  }

  return NextResponse.json({ ok: true });
}
