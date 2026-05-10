'use client';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext({});
export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io('', {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('spin-result', (data: { winAmount: number; newBalance: number }) => {
      if (data.winAmount > 0) {
        toast.success(`Вы выиграли ${data.winAmount} фишек! Баланс: ${data.newBalance}`, { duration: 5000 });
      } else {
        toast(`Вы проиграли. Баланс: ${data.newBalance}`, { icon: '😕', duration: 3000 });
      }
      refreshUser();
    });

    socket.on('leaderboard-update', () => {
      window.dispatchEvent(new Event('leaderboard-refresh'));
    });

    return () => {
      socket.disconnect();
    };
  }, [user, refreshUser]);

  return <SocketContext.Provider value={{}}>{children}</SocketContext.Provider>;
};