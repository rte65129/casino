export interface User {
  id: string;
  email: string;
  balance: number;
  totalWagered: number;
  totalWon: number;
  netProfit: number;
  createdAt: string;
}

export interface Bet {
  amount: number;
  type: 'number' | 'color' | 'parity' | 'dozen' | 'half';
  value: string;
}

export interface SpinResult {
  roundId: string;
  result: number;
  totalWin: number;
  newBalance: number;
}

export interface HistoryBet {
  id: string;
  amount: number;
  type: string;
  value: string;
  won: boolean;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  email: string;
  netProfit: number;
  totalWagered: number;
  totalWon: number;
}