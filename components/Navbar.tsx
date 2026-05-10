'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-green-400">Roulette</Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-gray-300">{user.email}</span>
              <span className="bg-green-700 px-2 py-1 rounded-full text-sm">{user.balance} 💰</span>
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