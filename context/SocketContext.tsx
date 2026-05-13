'use client';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext({});
export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
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

    // Больше не показываем тост и не обновляем пользователя здесь
    // socket.on('spin-result', ...) – удалён

    socket.on('leaderboard-update', () => {
      window.dispatchEvent(new Event('leaderboard-refresh'));
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return <SocketContext.Provider value={{}}>{children}</SocketContext.Provider>;
};