import { kv } from '@/lib/kv';
import { NextRequest, NextResponse } from 'next/server';
import { FriendBet, Circle } from '@/lib/types';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
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

export async function POST(req: NextRequest) {
  const bet: FriendBet = await req.json();
  const bets = await kv.get<FriendBet[]>('friendbets') ?? [];
  bets.unshift(bet);
  await kv.set('friendbets', bets);
  return NextResponse.json(bet);
}
