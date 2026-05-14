/**
 * Room management handlers
 */
function setupRoomHandlers(socket, roomManager, clientIp) {

  socket.on('createRoom', ({ playerName, roomName, settings, playerId, localIp }) => {
    console.log('createRoom received settings:', settings);

    // Delegate to RoomManager
    roomManager.createRoom({
      socket,
      playerName,
      playerId,
      roomName,
      settings,
      clientIp,
      localIp
    });
  });

  socket.on('joinRoom', ({ roomId, playerName, playerId }) => {
    roomManager.joinRoom(socket, { roomId, playerName, playerId });
  });

  socket.on('rejoinRoom', ({ roomId, playerId }) => {
    const room = roomManager.getRoom(roomId.toUpperCase());
    if (room) {
      const existingPlayer = room.players.find(p => p.playerId === playerId);
      if (existingPlayer) {
        existingPlayer.id = socket.id;
        existingPlayer.connected = true;

        // Clear any pending disconnect timeout for this player
        if (existingPlayer.disconnectTimeout) {
          clearTimeout(existingPlayer.disconnectTimeout);
          existingPlayer.disconnectTimeout = null;
          console.log(`Cleared disconnect timeout for player ${existingPlayer.name} on rejoin`);
        }

        socket.join(room.id);
        if (room.hostPlayerId === playerId) {
          room.hostId = socket.id;
          room.hostDisconnected = false;
          // Clear any pending host destroy timeout
          if (room.destroyTimeout) {
            clearTimeout(room.destroyTimeout);
            room.destroyTimeout = null;
            console.log(`Cleared destroy timeout for room ${roomId} on host rejoin`);
          }
        }

        socket.emit('roomJoined', room);
        roomManager.broadcastRoomUpdate(room.id);
        console.log(`Player ${existingPlayer.name} rejoined room ${roomId}`);
      } else {
        socket.emit('rejoinFailed');
        console.log(`Rejoin failed: player ${playerId} not found in room ${roomId}`);
      }
    } else {
      socket.emit('rejoinFailed');
      console.log(`Rejoin failed: room ${roomId} not found`);
    }
  });

  socket.on('updateSettings', ({ roomId, settings }) => {
    const room = roomManager.getRoom(roomId);
    if (room && room.hostId === socket.id) {
      room.settings = { ...room.settings, ...settings };
      roomManager.broadcastRoomUpdate(roomId);
      roomManager.broadcastRoomList();
    }
  });

  socket.on('contributeTheme', ({ roomId, themes }) => {
    const room = roomManager.getRoom(roomId);
    if (room) {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        // Add each theme with contributor information
        themes.forEach(theme => {
          // Check if this theme name already exists from this contributor
          const existingIndex = room.contributedThemes.findIndex(
            t => t.name === theme.name && t.contributorId === player.playerId
          );

          const themeData = {
            name: theme.name,
            // Support both new music format { songs, fillers } and legacy { words }
            songs: theme.songs || [],
            fillers: theme.fillers || [],
            words: theme.words || [],
            contributorId: player.playerId,
            contributorName: player.name
          };

          if (existingIndex >= 0) {
            room.contributedThemes[existingIndex] = themeData;
          } else {
            room.contributedThemes.push(themeData);
          }
        });

        roomManager.broadcastRoomUpdate(roomId);
        console.log(`${player.name} contributed ${themes.length} theme(s) to room ${roomId}`);
      }
    }
  });

  socket.on('leaveRoom', ({ roomId, playerId }) => {
    roomManager.leaveRoom(socket, roomId, playerId);
  });

  socket.on('checkRoom', ({ roomId }) => {
    const room = roomManager.getRoom(roomId.toUpperCase());
    if (!room) {
      socket.emit('roomStatus', { exists: false, error: 'La sala no existe' });
    } else if (room.players.length >= room.settings.players && room.settings.players !== null) {
      socket.emit('roomStatus', { exists: true, full: true, error: 'La sala está llena' });
    } else {
      socket.emit('roomStatus', { exists: true, full: false, room: room });
    }
  });

  socket.on('requestRoomList', () => {
    socket.emit('roomList', roomManager.getRoomsList());
  });
}

module.exports = { setupRoomHandlers };
