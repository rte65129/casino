'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { HistoryBet } from '@/types';

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryBet[]>([]);
  const [replenishAmount, setReplenishAmount] = useState('');
  const [replenishMessage, setReplenishMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/history', { credentials: 'include' })
      .then(res => res.json())
      .then(setHistory)
      .catch(console.error);
  }, [user]);

  const handleReplenish = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setReplenishMessage('');
    const amount = parseInt(replenishAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      setReplenishMessage('Введите положительную сумму');
      return;
    }
    try {
      const res = await fetch('/api/profile/replenish', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) {
        const err = await res.json();
        setReplenishMessage(err.error || 'Ошибка пополнения');
        return;
      }
      await refreshUser(); // обновляет контекст (и навбар)
      setReplenishMessage('Баланс пополнен');
      setReplenishAmount('');
    } catch (e) {
      setReplenishMessage('Ошибка сети');
    }
  }, [replenishAmount, refreshUser]);

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

      {/* Форма пополнения */}
      <div className="bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-lg font-bold mb-2">Пополнить баланс</h2>
        <form onSubmit={handleReplenish} className="flex gap-3 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-gray-400">Сумма</label>
            <input
              type="number"
              min="1"
              value={replenishAmount}
              onChange={(e) => setReplenishAmount(e.target.value)}
              className="bg-gray-700 px-3 py-2 rounded w-32"
              placeholder="1000"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold"
          >
            Пополнить
          </button>
        </form>
        {replenishMessage && (
          <p className={`text-sm mt-2 ${replenishMessage.includes('Ошибка') ? 'text-red-400' : 'text-green-400'}`}>
            {replenishMessage}
          </p>
        )}
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