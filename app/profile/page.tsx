'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HistoryBet } from '@/types';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryBet[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/history', { credentials: 'include' })
      .then(res => res.json())
      .then(setHistory)
      .catch(console.error);
  }, [user]);

  if (loading) return <div className="text-center">Загрузка...</div>;
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Профиль</h1>
      <div className="bg-gray-800 p-4 rounded mb-6 grid grid-cols-2 gap-4">
        <div><span className="text-gray-400">Email:</span> {user.email}</div>
        <div><span className="text-gray-400">Баланс:</span> {user.balance}</div>
        <div><span className="text-gray-400">Всего ставок:</span> {user.totalWagered}</div>
        <div><span className="text-gray-400">Всего выигрышей:</span> {user.totalWon}</div>
        <div><span className="text-gray-400">Чистая прибыль:</span> {user.netProfit}</div>
        <div><span className="text-gray-400">Регистрация:</span> {new Date(user.createdAt).toLocaleDateString()}</div>
      </div>
      <h2 className="text-xl font-bold mb-2">История ставок</h2>
      {history.length === 0 ? <p className="text-gray-400">Нет ставок</p> :
        <div className="space-y-2">
          {history.map(bet => (
            <div key={bet.id} className={`p-3 rounded flex justify-between ${bet.won ? 'bg-green-800/30' : 'bg-red-800/30'}`}>
              <span>{bet.type}: {bet.value} — {bet.amount} 💰</span>
              <span>{bet.won ? 'Выигрыш' : 'Проигрыш'}</span>
              <span className="text-xs text-gray-400">{new Date(bet.createdAt).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      }
    </div>
  );
}