import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPayoutMultiplier, checkWin } from '@/lib/roulette';
import { getUserIdFromCookies } from '@/lib/auth';
import crypto from 'crypto';

declare global {
  var io: any;
}

export async function POST(req: Request) {
  const userId = await getUserIdFromCookies();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { bets } = (await req.json()) as {
    bets: { amount: number; type: string; value: string }[];
  };

  if (!bets || !Array.isArray(bets) || bets.length === 0) {
    return NextResponse.json({ error: 'No bets provided' }, { status: 400 });
  }

  const totalStake = bets.reduce((sum, b) => sum + b.amount, 0);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { balance: true },
      });

      if (user.balance < totalStake) {
        throw new Error('Insufficient balance');
      }

      // 2. Списание
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: totalStake } },
      });

      // 3. Генерация результата
      const randomBuffer = crypto.randomBytes(4);
      const randomInt = randomBuffer.readUInt32BE(0);
      const resultNumber = randomInt % 37;

      // 4. Раунд
      const round = await tx.round.create({
        data: { result: resultNumber },
      });

      // 5. Обработка каждой ставки
      let totalWin = 0;
      const betRecords = [];
      for (const bet of bets) {
        const payoutMultiplier = getPayoutMultiplier(bet.type);
        const isWin = checkWin(resultNumber, bet.type, bet.value);
        const winAmount = isWin ? bet.amount * (payoutMultiplier + 1) : 0;
        totalWin += winAmount;

        betRecords.push({
          amount: bet.amount,
          type: bet.type,
          value: bet.value,
          payout: payoutMultiplier,
          won: isWin,
          userId,
          roundId: round.id,
        });
      }

      await tx.bet.createMany({ data: betRecords });

      // 6. Обновление баланса и статистики
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: { increment: totalWin },
          totalWagered: { increment: totalStake },
          totalWon: { increment: totalWin },
          netProfit: { increment: totalWin - totalStake },
        },
        select: { email: true, balance: true, netProfit: true, totalWagered: true, totalWon: true },
      });

      return {
        roundId: round.id,
        result: resultNumber,
        totalWin,
        newBalance: updatedUser.balance,
        updatedUser,
      };
    });

    const io = global.io;
    if (io) {
      io.to(`user:${userId}`).emit('spin-result', {
        winAmount: result.totalWin - totalStake,
        newBalance: result.newBalance,
        result: result.result,
      });

      io.emit('leaderboard-update');
    }

    return NextResponse.json({
      roundId: result.roundId,
      result: result.result,
      totalWin: result.totalWin,
      newBalance: result.newBalance,
    });
  } catch (error: any) {
    if (error.message === 'Insufficient balance') {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}