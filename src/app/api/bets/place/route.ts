import { kv } from '@/lib/kv';
import { NextRequest, NextResponse } from 'next/server';
import { Bet, FriendBet, UserProfile } from '@/lib/types';

export async function POST(req: NextRequest) {
  const bet: Bet = await req.json();

  const bets = await kv.get<Bet[]>('bets') ?? [];
  bets.unshift(bet);
  await kv.set('bets', bets);

  const friendBets = await kv.get<FriendBet[]>('friendbets') ?? [];
  const fb = friendBets.find((f) => f.id === bet.marketId);
  if (fb) {
    fb.bets.push(bet);
    fb.totalPool += bet.amount;
    await kv.set('friendbets', friendBets);
  }

  const profile = await kv.get<UserProfile>(`profile:${bet.bettor}`);
  if (profile) {
    profile.stats.totalBets += 1;
    profile.stats.pending += 1;
    profile.stats.totalVolume += bet.amount;
    await kv.set(`profile:${bet.bettor}`, profile);
  }

  return NextResponse.json({ ok: true });
}
