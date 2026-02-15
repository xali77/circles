import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { Circle } from '@/lib/types';

// GET /api/circles — all circles
export async function GET() {
  const circles = await kv.get<Circle[]>('circles') ?? [];
  return NextResponse.json(circles);
}

// POST /api/circles — create circle
export async function POST(req: NextRequest) {
  const circle: Circle = await req.json();
  const circles = await kv.get<Circle[]>('circles') ?? [];
  circles.push(circle);
  await kv.set('circles', circles);
  // index invite code for fast lookup
  await kv.set(`circle:invite:${circle.inviteCode}`, circle.id);
  return NextResponse.json(circle);
}
