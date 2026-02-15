import { kv } from '@/lib/kv';
import { NextRequest, NextResponse } from 'next/server';
import { Circle } from '@/lib/types';

export async function GET() {
  const circles = await kv.get<Circle[]>('circles') ?? [];
  return NextResponse.json(circles);
}

export async function POST(req: NextRequest) {
  const circle: Circle = await req.json();
  const circles = await kv.get<Circle[]>('circles') ?? [];
  circles.push(circle);
  await kv.set('circles', circles);
  await kv.set(`circle:invite:${circle.inviteCode}`, circle.id);
  return NextResponse.json(circle);
}
