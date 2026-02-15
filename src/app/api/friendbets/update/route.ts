import { getKV } from '@/lib/kv';
import { NextRequest, NextResponse } from 'next/server';
import { FriendBet } from '@/lib/types';

// PATCH /api/friendbets/update — resolve a friend bet
export async function PATCH(req: NextRequest) {
  const { id, updates }: { id: string; updates: Partial<FriendBet> } = await req.json();
  const kv = getKV();
  const bets = await kv.get<FriendBet[]>('friendbets') ?? [];
  const idx = bets.findIndex((b) => b.id === id);
  if (idx === -1) return NextResponse.json({ error: 'bet not found' }, { status: 404 });
  bets[idx] = { ...bets[idx], ...updates };
  await kv.set('friendbets', bets);
  return NextResponse.json({ ok: true });
}
