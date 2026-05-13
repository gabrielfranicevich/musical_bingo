import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const useSocketConnection = (url) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const serverUrl = url || (import.meta.env.PROD ? window.location.origin : undefined);
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('error', (msg) => {
      alert('Error: ' + msg);
    });

    return () => newSocket.close();
  }, [url]);

  return { socket, isConnected };
};
