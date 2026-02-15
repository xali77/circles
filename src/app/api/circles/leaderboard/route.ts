import { getKV } from '@/lib/kv';
import { NextRequest, NextResponse } from 'next/server';
import { Circle, UserProfile, LeaderboardEntry, Badge } from '@/lib/types';

function getBadges(p: UserProfile): Badge[] {
  const s = p.stats;
  const badges: Badge[] = [];
  if (s.totalBets >= 20 && s.wins / s.totalBets >= 0.8) badges.push('oracle');
  if (s.totalBets >= 15) badges.push('degen');
  if (s.totalVolume >= 100) badges.push('whale');
  if (s.currentStreak >= 5) badges.push('streak');
  return badges;
}

// GET /api/circles/leaderboard?circleId=xxx
export async function GET(req: NextRequest) {
  const circleId = req.nextUrl.searchParams.get('circleId');
  if (!circleId) return NextResponse.json({ error: 'circleId required' }, { status: 400 });

  const kv = getKV();
  const circles = await kv.get<Circle[]>('circles') ?? [];
  const circle = circles.find((c) => c.id === circleId);
  if (!circle) return NextResponse.json([]);

  // fetch profiles for all members
  const profileKeys = circle.members.map((m) => `profile:${m.address}`);
  if (profileKeys.length === 0) return NextResponse.json([]);

  const profiles = await kv.mget<UserProfile[]>(...profileKeys);

  const entries: LeaderboardEntry[] = profiles
    .filter((p): p is UserProfile => p !== null)
    .map((p) => ({ ...p, rank: 0, badges: getBadges(p) }))
    .sort((a, b) => {
      const aRate = a.stats.totalBets > 0 ? a.stats.wins / a.stats.totalBets : 0;
      const bRate = b.stats.totalBets > 0 ? b.stats.wins / b.stats.totalBets : 0;
      if (bRate !== aRate) return bRate - aRate;
      return b.stats.netPnL - a.stats.netPnL;
    });

  entries.forEach((e, i) => (e.rank = i + 1));
  return NextResponse.json(entries);
}
