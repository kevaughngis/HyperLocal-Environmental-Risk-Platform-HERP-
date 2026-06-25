import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';

let io: Server;

export function initializeSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected to WebSocket');
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export function emitAlert(alert: any) {
  if (io) {
    io.emit('environmental_alert', alert);
  }
}
