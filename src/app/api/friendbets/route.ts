import { getKV } from '@/lib/kv';
import { NextRequest, NextResponse } from 'next/server';
import { FriendBet, Circle } from '@/lib/types';

// GET /api/friendbets?address=0x... — get feed bets for user's circles
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  const kv = getKV();
  const allFriendBets = await kv.get<FriendBet[]>('friendbets') ?? [];

  if (address) {
    const circles = await kv.get<Circle[]>('circles') ?? [];
    const myCircleIds = new Set(
      circles.filter((c) => c.members.some((m) => m.address === address)).map((c) => c.id)
    );
    const feed = allFriendBets
      .filter((b) => myCircleIds.has(b.circleId))
      .sort((a, b) => b.createdAt - a.createdAt);
    return NextResponse.json(feed);
  }

  return NextResponse.json(allFriendBets);
}

// POST /api/friendbets — create a friend bet
export async function POST(req: NextRequest) {
  const bet: FriendBet = await req.json();
  const kv = getKV();
  const bets = await kv.get<FriendBet[]>('friendbets') ?? [];
  bets.unshift(bet);
  await kv.set('friendbets', bets);
  return NextResponse.json(bet);
}
