import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromCookies } from '@/lib/auth';

export async function POST(req: Request) {
  const userId = await getUserIdFromCookies();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { amount } = await req.json();
  const replenishAmount = parseInt(amount, 10);

  if (isNaN(replenishAmount) || replenishAmount <= 0) {
    return NextResponse.json({ error: 'Amount must be a positive integer' }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { balance: { increment: replenishAmount } },
    select: { balance: true },
  });

  return NextResponse.json({ newBalance: updatedUser.balance });
}