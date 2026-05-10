import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromCookies } from '@/lib/auth';

export async function GET() {
  const userId = await getUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      balance: true,
      totalWagered: true,
      totalWon: true,
      netProfit: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}