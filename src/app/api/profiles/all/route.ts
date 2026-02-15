import { kv } from '@/lib/kv';
import { NextResponse } from 'next/server';
import { UserProfile } from '@/lib/types';

export async function GET() {
  const keys = await kv.keys('profile:*');
  if (keys.length === 0) return NextResponse.json({});
  const values = await kv.mget<UserProfile>(...keys);
  const map: Record<string, UserProfile> = {};
  keys.forEach((k, i) => {
    const address = k.replace('profile:', '');
    if (values[i]) map[address] = values[i]!;
  });
  return NextResponse.json(map);
}
