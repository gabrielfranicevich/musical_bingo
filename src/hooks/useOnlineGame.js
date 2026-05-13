import { useState, useEffect, useCallback } from 'react';
import { useSocketConnection } from './game/useSocketConnection';
import { CHART_ITEMS, DEFAULT_MATRIX, DEFAULT_PATTERNS } from '../data/constants';

export const useOnlineGame = (setScreen, mySessionId, localIp, playerName) => {
  const { socket, isConnected } = useSocketConnection();
  const [onlineGames, setOnlineGames] = useState([]);
  const [lanGames, setLanGames] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [roomData, setRoomData] = useState(null);

  // Derived State
  const isHost = roomData?.hostPlayerId === mySessionId;

  // Creation Settings
  const [newGameSettings, setNewGameSettings] = useState({
    name: '',
    players: null,
    type: 'in_person',
    isPrivate: false,
  });

  // Socket Event Listeners
  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (room) => {
      setRoomId(room.id);
      setRoomData(room);
      setScreen('online_waiting');
    };

    const handleRoomList = (rooms) => setOnlineGames(rooms);
    const handleLanGamesList = (games) => setLanGames(games);

    const handleRoomJoined = (room) => {
      setRoomId(room.id);
      setRoomData(room);
      setScreen('online_waiting');
    };

    const handleRoomUpdated = (room) => setRoomData(room);

    const handleGameStarted = (room) => {
      setRoomData(room);
      setScreen('online_playing');
    };

    const handleGameDataUpdated = (gameData) => {
      setRoomData(prevRoom => {
        if (!prevRoom) return null;
        return { ...prevRoom, gameData };
      });
    };

    const handleGameReset = (room) => {
      setRoomData(room);
      setScreen('online_waiting');
    };

    const handleRoomClosed = ({ message }) => {
      alert(message);
      setRoomData(null);
      setRoomId(null);
      setScreen('online_lobby');
    };

    const handleRejoinFailed = () => {
      localStorage.removeItem('lastRoomId');
      setRoomId(null);
      setRoomData(null);
    };

    socket.on('roomCreated', handleRoomCreated);
    socket.on('roomList', handleRoomList);
    socket.on('lanGamesList', handleLanGamesList);
    socket.on('roomJoined', handleRoomJoined);
    socket.on('roomUpdated', handleRoomUpdated);
    socket.on('gameStarted', handleGameStarted);
    socket.on('gameDataUpdated', handleGameDataUpdated);
    socket.on('gameReset', handleGameReset);
    socket.on('roomClosed', handleRoomClosed);
    socket.on('rejoinFailed', handleRejoinFailed);

    return () => {
      socket.off('roomCreated', handleRoomCreated);
      socket.off('roomList', handleRoomList);
      socket.off('lanGamesList', handleLanGamesList);
      socket.off('roomJoined', handleRoomJoined);
      socket.off('roomUpdated', handleRoomUpdated);
      socket.off('gameStarted', handleGameStarted);
      socket.off('gameDataUpdated', handleGameDataUpdated);
      socket.off('gameReset', handleGameReset);
      socket.off('roomClosed', handleRoomClosed);
      socket.off('rejoinFailed', handleRejoinFailed);
    };
  }, [socket, setScreen]);

  // Initial requests
  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('requestRoomList');
      if (mySessionId) {
        const lastRoomId = localStorage.getItem('lastRoomId');
        if (lastRoomId) {
          socket.emit('rejoinRoom', { roomId: lastRoomId, playerId: mySessionId });
        }
      }
    }
  }, [socket, isConnected, mySessionId]);

  // Actions
  const createOnlineGame = useCallback((nameOverride) => {
    if (socket) {
      socket.emit('createRoom', {
        playerName: nameOverride || playerName || 'Host',
        roomName: newGameSettings.name,
        settings: {
          players: newGameSettings.players,
          type: newGameSettings.type,
          isPrivate: newGameSettings.isPrivate,
        },
        playerId: mySessionId,
        localIp: localIp
      });
      localStorage.setItem('lastRoomId', '');
    }
  }, [socket, playerName, newGameSettings, mySessionId, localIp]);

  const joinOnlineGame = useCallback((id, nameOverride) => {
    if (socket) {
      socket.emit('joinRoom', { roomId: id, playerName: nameOverride || playerName || 'Jugador', playerId: mySessionId });
      localStorage.setItem('lastRoomId', id);
    }
  }, [socket, playerName, mySessionId]);

  const updateRoomSettings = useCallback((settings) => {
    if (socket && roomId && isHost) {
      socket.emit('updateSettings', { roomId, settings });
    }
  }, [socket, roomId, isHost]);

  const leaveRoom = useCallback(() => {
    if (socket && roomId) {
      socket.emit('leaveRoom', { roomId, playerId: mySessionId });
    }
    setRoomData(null);
    setRoomId(null);
    setScreen('online_lobby');
    localStorage.removeItem('lastRoomId');
    window.history.pushState(null, '', '/online');
  }, [socket, roomId, mySessionId, setScreen]);

  const resetOnlineGame = useCallback(() => {
    if (socket && roomId) {
      socket.emit('resetGame', { roomId });
    }
  }, [socket, roomId]);

  const startOnlineGame = useCallback(() => {
    if (!socket || !isHost || !roomId || !roomData) return;

    const selectedGenres = roomData.settings.selectedGenres || ['basico'];

    // Flatten CHART_ITEMS for the selected genres → pool of card labels
    const cardItems = [...new Set(
      selectedGenres.flatMap(genre => CHART_ITEMS[genre] || [])
    )];

    socket.emit('startGame', { roomId, cardItems });
  }, [socket, isHost, roomId, roomData]);

  const markCell = useCallback((row, col) => {
    if (socket && roomId) {
      socket.emit('markCell', { roomId, row, col });
    }
  }, [socket, roomId]);

  const nextSong = useCallback(() => {
    if (socket && roomId && isHost) {
      socket.emit('nextSong', { roomId });
    }
  }, [socket, roomId, isHost]);

  return {
    socket,
    onlineGames,
    setOnlineGames,
    lanGames,
    setLanGames,
    roomId,
    setRoomId,
    isHost,
    roomData,
    setRoomData,
    newGameSettings,
    setNewGameSettings,
    createOnlineGame,
    joinOnlineGame,
    updateRoomSettings,
    leaveRoom,
    resetOnlineGame,
    startOnlineGame,
    markCell,
    nextSong,
  };
};
