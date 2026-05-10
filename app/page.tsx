'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import RouletteWheel from '@/components/RouletteWheel';
import BetPanel from '@/components/BetPanel';
import { Bet, SpinResult } from '@/types';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [bets, setBets] = useState<Bet[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [balance, setBalance] = useState(user?.balance || 0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) setBalance(user.balance);
  }, [user]);

  const totalStake = bets.reduce((sum, b) => sum + b.amount, 0);

  const spin = async () => {
    if (bets.length === 0 || spinning) return;

    setSpinning(true);
    setResult(null);
    setLastWin(null);
    setShowResult(false);

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
      setBalance(data.newBalance);
      setLastWin(data.totalWin - totalStake);

      setTimeout(() => {
        setSpinning(false);
        setBets([]);
        setShowResult(true);
      }, 5000);
    } catch (e) {
      console.error(e);
      setSpinning(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Загрузка...</div>;
  if (!user) return null;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Рулетка</h1>
      <p className="mb-2">
        Баланс: <span className="text-green-400 font-bold">{balance}</span>
      </p>

      <RouletteWheel result={result} spinning={spinning} />

      {showResult && lastWin !== null && (
        <p className={`text-lg mb-4 ${lastWin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {lastWin >= 0 ? `Выигрыш: +${lastWin}` : `Проигрыш: ${lastWin}`}
        </p>
      )}

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