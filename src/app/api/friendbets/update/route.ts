import { kv } from '@/lib/kv';
import { NextRequest, NextResponse } from 'next/server';
import { FriendBet } from '@/lib/types';

export async function PATCH(req: NextRequest) {
  const { id, updates }: { id: string; updates: Partial<FriendBet> } = await req.json();
  const bets = await kv.get<FriendBet[]>('friendbets') ?? [];
  const idx = bets.findIndex((b) => b.id === id);
  if (idx === -1) return NextResponse.json({ error: 'bet not found' }, { status: 404 });
  bets[idx] = { ...bets[idx], ...updates };
  await kv.set('friendbets', bets);
  return NextResponse.json({ ok: true });
}
