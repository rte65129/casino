'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import RouletteWheel from '@/components/RouletteWheel';
import BetPanel from '@/components/BetPanel';
import { Bet, SpinResult } from '@/types';

export default function Home() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [bets, setBets] = useState<Bet[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [displayBalance, setDisplayBalance] = useState(user?.balance || 0);
  const [displayWin, setDisplayWin] = useState<number | null>(null);

  const pendingResultRef = useRef<SpinResult | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !spinning) {
      setDisplayBalance(user.balance);
    }
  }, [user, spinning]);

  const totalStake = bets.reduce((sum, b) => sum + b.amount, 0);

  const spin = async () => {
    if (bets.length === 0 || spinning) return;

    setSpinning(true);
    setShowResult(false);
    setDisplayWin(null);
    pendingResultRef.current = null;

    try {
      const res = await fetch('/api/game/spin', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bets }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Ошибка');
        setSpinning(false);
        return;
      }

      const data: SpinResult = await res.json();
      setResult(data.result);
      pendingResultRef.current = data;
    } catch (e) {
      console.error(e);
      setSpinning(false);
    }
  };

  const handleSpinEnd = useCallback(() => {
    const data = pendingResultRef.current;
    if (data) {
      const winAmount = data.totalWin - totalStake;
      setDisplayBalance(data.newBalance);
      setDisplayWin(winAmount);
      setShowResult(true);

      // if (winAmount > 0) {
      //   toast.success(`Вы выиграли ${winAmount} фишек!`, { duration: 4000 });
      // } else {
      //   toast('Вы проиграли', { icon: '😕', duration: 3000 });
      // }

      refreshUser();
    }
    setSpinning(false);
    setBets([]);
    pendingResultRef.current = null;
  }, [totalStake, refreshUser]);

  if (loading) return <div className="text-center mt-10">Загрузка...</div>;
  if (!user) return null;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Рулетка</h1>
      <p className="mb-2">
        Баланс: <span className="text-green-400 font-bold">{displayBalance}</span>
      </p>

      <RouletteWheel
        result={result}
        spinning={spinning}
        onAnimationEnd={handleSpinEnd}
      />

      {/* Зарезервированное место для результата, чтобы не сдвигать панель ставок */}
      <div className="h-10 flex items-center justify-center mb-4">
        {showResult && displayWin !== null && (
          <p className={`text-lg ${displayWin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {displayWin >= 0 ? `Выигрыш: +${displayWin}` : `Проигрыш: ${displayWin}`}
          </p>
        )}
      </div>

      <BetPanel
        onAddBet={(bet) => setBets((prev) => [...prev, bet])}
        betsCount={bets.length}
        totalStake={totalStake}
        onSpin={spin}
        spinning={spinning}
      />
    </div>
  );
}