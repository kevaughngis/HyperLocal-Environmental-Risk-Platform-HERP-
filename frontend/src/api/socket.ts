import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
});

export const useSocket = (onAlert: (alert: any) => void) => {
  const setup = () => {
    socket.on('environmental_alert', onAlert);
  };

  const cleanup = () => {
    socket.off('environmental_alert', onAlert);
  };

  return { setup, cleanup };
};
