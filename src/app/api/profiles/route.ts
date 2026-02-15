import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/types';

// GET /api/profiles?address=0x...
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });
  const profile = await kv.get<UserProfile>(`profile:${address}`);
  return NextResponse.json(profile);
}

// POST /api/profiles — upsert profile
export async function POST(req: NextRequest) {
  const profile: UserProfile = await req.json();
  if (!profile.address) return NextResponse.json({ error: 'address required' }, { status: 400 });
  await kv.set(`profile:${profile.address}`, profile);
  return NextResponse.json({ ok: true });
}
