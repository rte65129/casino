'use client';
import { useState } from 'react';
import { Bet } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface BetPanelProps {
  onAddBet: (bet: Bet) => void;
  betsCount: number;
  totalStake: number;
  onSpin: () => void;
  spinning: boolean;
}

const betTypes = [
  { key: 'number', label: 'Число (35x)' },
  { key: 'color', label: 'Цвет (1x)' },
  { key: 'parity', label: 'Чёт/Нечет (1x)' },
  { key: 'dozen', label: 'Дюжина (2x)' },
  { key: 'half', label: '1-18 / 19-36 (1x)' },
];

export default function BetPanel({ onAddBet, betsCount, totalStake, onSpin, spinning }: BetPanelProps) {
  const { user } = useAuth();
  const [type, setType] = useState<Bet['type']>('number');
  const [value, setValue] = useState('');
  const [amount, setAmount] = useState(10);
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!user) { setError('Войдите, чтобы делать ставки'); return; }
    if (amount <= 0 || amount > user.balance) { setError('Недостаточно средств'); return; }
    if (!value) { setError('Выберите значение'); return; }
    if (type === 'number') {
      const num = parseInt(value);
      if (isNaN(num) || num < 0 || num > 36) { setError('Число от 0 до 36'); return; }
    }
    setError('');
    onAddBet({ amount, type, value });
    setValue('');
  };

  const renderValueInput = () => {
    switch (type) {
      case 'number':
        return <input type="number" min="0" max="36" value={value} onChange={e => setValue(e.target.value)}
          className="bg-gray-700 px-3 py-1 rounded w-20" placeholder="0-36" />;
      case 'color':
        return <select value={value} onChange={e => setValue(e.target.value)} className="bg-gray-700 px-3 py-1 rounded">
          <option value="">--</option>
          <option value="red">red</option><option value="black">black</option>
        </select>;
      case 'parity':
        return <select value={value} onChange={e => setValue(e.target.value)} className="bg-gray-700 px-3 py-1 rounded">
          <option value="">--</option>
          <option value="even">even</option><option value="odd">odd</option>
        </select>;
      case 'dozen':
        return <select value={value} onChange={e => setValue(e.target.value)} className="bg-gray-700 px-3 py-1 rounded">
          <option value="">--</option>
          <option value="1">1st</option><option value="2">2nd</option><option value="3">3rd</option>
        </select>;
      case 'half':
        return <select value={value} onChange={e => setValue(e.target.value)} className="bg-gray-700 px-3 py-1 rounded">
          <option value="">--</option>
          <option value="1-18">1-18</option><option value="19-36">19-36</option>
        </select>;
      default: return null;
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg max-w-lg mx-auto">
      <h2 className="text-lg font-bold mb-2">Ставки</h2>
      <div className="flex flex-wrap gap-2 mb-3">
        {betTypes.map(bt => (
          <button key={bt.key} onClick={() => setType(bt.key as Bet['type'])}
            className={`px-3 py-1 rounded text-sm ${type === bt.key ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
            {bt.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-end mb-2">
        <div className="flex flex-col">
          <label className="text-xs text-gray-400">Сумма</label>
          <input type="number" min="1" value={amount} onChange={e => setAmount(parseInt(e.target.value) || 0)}
            className="bg-gray-700 px-3 py-1 rounded w-24" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-400">Значение</label>
          {renderValueInput()}
        </div>
        <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm h-10">+ Ставка</button>
      </div>
      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      <div className="flex justify-between items-center mt-3">
        <div><span>Ставок: {betsCount}</span> • <span>Сумма: {totalStake}</span></div>
        <button onClick={onSpin} disabled={betsCount === 0 || spinning}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 px-6 py-2 rounded font-bold">
          {spinning ? 'Вращение...' : 'Крутить'}
        </button>
      </div>
    </div>
  );
}