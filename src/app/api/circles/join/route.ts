import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { Circle, CircleMember } from '@/lib/types';

// POST /api/circles/join — join a circle
export async function POST(req: NextRequest) {
  const { circleId, member }: { circleId: string; member: CircleMember } = await req.json();
  const circles = await kv.get<Circle[]>('circles') ?? [];
  const circle = circles.find((c) => c.id === circleId);
  if (!circle) return NextResponse.json({ error: 'circle not found' }, { status: 404 });
  if (circle.members.some((m) => m.address === member.address)) {
    return NextResponse.json({ error: 'already a member' }, { status: 409 });
  }
  circle.members.push(member);
  await kv.set('circles', circles);
  return NextResponse.json({ ok: true });
}
