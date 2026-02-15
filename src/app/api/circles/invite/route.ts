import { kv } from '@/lib/kv';
import { NextRequest, NextResponse } from 'next/server';
import { Circle } from '@/lib/types';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.toUpperCase();
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 });

  const circleId = await kv.get<string>(`circle:invite:${code}`);
  if (circleId) {
    const circles = await kv.get<Circle[]>('circles') ?? [];
    const circle = circles.find((c) => c.id === circleId);
    if (circle) return NextResponse.json(circle);
  }

  const circles = await kv.get<Circle[]>('circles') ?? [];
  const circle = circles.find((c) => c.inviteCode === code);
  return NextResponse.json(circle ?? null);
}
