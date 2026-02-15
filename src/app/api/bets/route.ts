import { getKV } from '@/lib/kv';
import { NextRequest, NextResponse } from 'next/server';
import { Bet } from '@/lib/types';

// GET /api/bets?bettor=0x... — get bets for a user
export async function GET(req: NextRequest) {
  const bettor = req.nextUrl.searchParams.get('bettor');
  const kv = getKV();
  const allBets = await kv.get<Bet[]>('bets') ?? [];
  if (bettor) {
    return NextResponse.json(allBets.filter((b) => b.bettor === bettor));
  }
  return NextResponse.json(allBets);
}
