import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromCookies } from '@/lib/auth';

export async function GET() {
  const userId = await getUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const history = await prisma.bet.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      amount: true,
      type: true,
      value: true,
      won: true,
      createdAt: true,
    },
  });

  return NextResponse.json(history);
}