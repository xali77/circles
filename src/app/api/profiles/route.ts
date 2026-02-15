import { kv } from '@/lib/kv';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/types';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });
  const profile = await kv.get<UserProfile>(`profile:${address}`);
  return NextResponse.json(profile);
}

export async function POST(req: NextRequest) {
  const profile: UserProfile = await req.json();
  if (!profile.address) return NextResponse.json({ error: 'address required' }, { status: 400 });
  await kv.set(`profile:${profile.address}`, profile);
  return NextResponse.json({ ok: true });
}
