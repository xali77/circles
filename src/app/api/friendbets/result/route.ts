import { getKV } from '@/lib/kv';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/types';

// POST /api/friendbets/result — record bet result for a user
export async function POST(req: NextRequest) {
  const { address, won, pnl }: { address: string; won: boolean; pnl: number } = await req.json();
  const kv = getKV();
  const profile = await kv.get<UserProfile>(`profile:${address}`);
  if (!profile) return NextResponse.json({ error: 'profile not found' }, { status: 404 });

  profile.stats.pending = Math.max(0, profile.stats.pending - 1);
  if (won) {
    profile.stats.wins += 1;
    profile.stats.currentStreak += 1;
    profile.stats.bestStreak = Math.max(profile.stats.bestStreak, profile.stats.currentStreak);
  } else {
    profile.stats.losses += 1;
    profile.stats.currentStreak = 0;
  }
  profile.stats.netPnL += pnl;
  await kv.set(`profile:${address}`, profile);
  return NextResponse.json({ ok: true });
}
