'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-gray-800 p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Регистрация</h1>
      {error && <p className="text-red-400 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-700 px-4 py-2 rounded" required />
        <input type="password" placeholder="Пароль (минимум 6 символов)" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-700 px-4 py-2 rounded" required />
        <button type="submit" className="bg-green-600 hover:bg-green-700 py-2 rounded font-semibold">
          Зарегистрироваться
        </button>
      </form>
      <p className="mt-4 text-gray-400">
        Уже есть аккаунт? <Link href="/login" className="text-green-400">Войти</Link>
      </p>
    </div>
  );
}