import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const leaders = await prisma.user.findMany({
    orderBy: { netProfit: 'desc' },
    take: 50,
    select: {
      id: true,
      email: true,
      netProfit: true,
      totalWagered: true,
      totalWon: true,
    },
  });
  return NextResponse.json(leaders);
}