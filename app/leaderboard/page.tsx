'use client';
import { useEffect, useState } from 'react';
import { LeaderboardEntry } from '@/types';

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard', { credentials: 'include' });
      const data = await res.json();
      setPlayers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const refreshHandler = () => fetchLeaderboard();
    window.addEventListener('leaderboard-refresh', refreshHandler);
    return () => window.removeEventListener('leaderboard-refresh', refreshHandler);
  }, []);

  if (loading) return <div className="text-center">Загрузка...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Лидерборд</h1>
      <table className="w-full bg-gray-800 rounded overflow-hidden">
        <thead>
          <tr className="bg-gray-700 text-left">
            <th className="p-2">#</th>
            <th className="p-2">Игрок</th>
            <th className="p-2">Сумма ставок</th>
            <th className="p-2">Выигрыш</th>
            <th className="p-2">Прибыль</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={p.id} className="border-t border-gray-700">
              <td className="p-2">{i + 1}</td>
              <td className="p-2">{p.email}</td>
              <td className="p-2">{p.totalWagered}</td>
              <td className="p-2">{p.totalWon}</td>
              <td className={`p-2 font-bold ${p.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {p.netProfit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}