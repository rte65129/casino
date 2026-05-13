'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [showReplenish, setShowReplenish] = useState(false);
  const [replenishAmount, setReplenishAmount] = useState('');
  const [replenishMessage, setReplenishMessage] = useState('');

  const handleReplenish = async (e: React.FormEvent) => {
    e.preventDefault();
    setReplenishMessage('');
    const amount = parseInt(replenishAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      setReplenishMessage('Введите сумму > 0');
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
        setReplenishMessage(err.error || 'Ошибка');
        return;
      }
      await refreshUser();
      setReplenishMessage('Готово');
      setReplenishAmount('');
      // Автоматически скрываем форму через 2 секунды
      setTimeout(() => {
        setShowReplenish(false);
        setReplenishMessage('');
      }, 2000);
    } catch {
      setReplenishMessage('Ошибка сети');
    }
  };

  if (loading) return null;

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-green-400">Roulette</Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-gray-300">{user.email}</span>

              {/* Баланс с кнопкой пополнения */}
              <div className="relative flex items-center gap-1">
                <span className="bg-green-700 px-2 py-1 rounded-full text-sm">
                  {user.balance} 💰
                </span>
                <button
                  onClick={() => setShowReplenish(!showReplenish)}
                  className="text-green-400 hover:text-green-300 text-lg font-bold leading-none"
                  title="Пополнить баланс"
                >
                  +
                </button>

                {showReplenish && (
                  <form
                    onSubmit={handleReplenish}
                    className="absolute top-full right-0 mt-2 bg-gray-700 p-3 rounded shadow-lg z-30 flex gap-2 items-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-300 mb-1">Сумма</label>
                      <input
                        type="number"
                        min="1"
                        value={replenishAmount}
                        onChange={(e) => setReplenishAmount(e.target.value)}
                        className="bg-gray-600 px-2 py-1 rounded w-24 text-white text-sm"
                        placeholder="1000"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-semibold"
                    >
                      Пополнить
                    </button>
                    {replenishMessage && (
                      <span className={`text-xs ml-2 ${replenishMessage === 'Готово' ? 'text-green-400' : 'text-red-400'}`}>
                        {replenishMessage}
                      </span>
                    )}
                  </form>
                )}
              </div>

              <Link href="/profile" className="hover:text-green-400">Профиль</Link>
              <Link href="/leaderboard" className="hover:text-green-400">Лидеры</Link>
              <button
                onClick={async () => { await logout(); router.push('/login'); }}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-green-400">Войти</Link>
              <Link href="/register" className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}