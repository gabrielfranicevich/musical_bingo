/**
 * RoomManager - Centralizes room state management and broadcasting
 */
const { generateRoomCode, sanitizeName } = require('./utils.cjs');

class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = {};
  }

  // --- Read Methods ---

  getRoom(roomId) {
    return this.rooms[roomId];
  }

  getAllRooms() {
    return Object.values(this.rooms);
  }

  getRoomsList() {
    return Object.values(this.rooms)
      .filter(r => !r.isPrivate)
      .map(r => ({
        id: r.id,
        name: r.roomName || r.players[0].name,
        players: r.players.length,
        maxPlayers: r.settings.players,
        type: r.settings.type,
        status: r.status
      }));
  }

  // --- Broadcasting ---

  broadcastRoomList() {
    this.io.emit('roomList', this.getRoomsList());
  }

  broadcastRoomUpdate(roomId) {
    const room = this.rooms[roomId];
    if (room) {
      this.io.to(roomId).emit('roomUpdated', room);
    }
  }

  emitToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  // --- Room Lifecycle ---

  createRoom({ socket, playerName, playerId, roomName, settings, clientIp, localIp }) {
    const safeName = sanitizeName(playerName);
    const roomId = generateRoomCode();

    this.rooms[roomId] = {
      id: roomId,
      hostId: socket.id,
      hostPlayerId: playerId,
      players: [{ id: socket.id, playerId, name: safeName, score: 0 }],
      roomName: roomName || safeName,
      gameData: null,
      status: 'waiting',
      creatorPublicIp: clientIp,
      creatorLocalIp: localIp || null,
      contributedThemes: [],
      isPrivate: settings?.isPrivate || false,
      settings: {
        players: settings?.players == null ? null : Number(settings.players),
        type: settings?.type || 'in_person',
        selectedGenres: ['basico'],
        matrixSize: { rows: 3, cols: 3 },
        winningPatterns: [
          { id: 'horizontal', name: 'Fila horizontal', type: 'preset', enabled: true },
          { id: 'vertical',   name: 'Columna vertical', type: 'preset', enabled: true },
          { id: 'diagonal',   name: 'Diagonal',         type: 'preset', enabled: false }
        ],
        customPatterns: []
      }
    };

    socket.join(roomId);
    socket.emit('roomCreated', this.rooms[roomId]);
    this.broadcastRoomList();
    console.log(`Room ${roomId} created by ${socket.id} (${safeName})`);

    return this.rooms[roomId];
  }

  deleteRoom(roomId, reason = 'Room deleted') {
    if (this.rooms[roomId]) {
      delete this.rooms[roomId];
      console.log(`${reason}: ${roomId}`);
      this.broadcastRoomList();
    }
  }

  // --- Player Management ---

  joinRoom(socket, { roomId, playerName, playerId }) {
    const room = this.rooms[roomId.toUpperCase()];
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    const existingPlayer = room.players.find(p => p.playerId === playerId);

    if (existingPlayer) {
      existingPlayer.id = socket.id;
      existingPlayer.connected = true;

      // Clear any pending disconnect timeout for this player
      if (existingPlayer.disconnectTimeout) {
        clearTimeout(existingPlayer.disconnectTimeout);
        existingPlayer.disconnectTimeout = null;
        console.log(`Cleared disconnect timeout for player ${existingPlayer.name} on re-join`);
      }

      // If this player is the host, also clear the room destroy timeout
      if (room.hostPlayerId === existingPlayer.playerId) {
        room.hostId = socket.id;
        room.hostDisconnected = false;
        if (room.destroyTimeout) {
          clearTimeout(room.destroyTimeout);
          room.destroyTimeout = null;
          console.log(`Cleared destroy timeout for room ${room.id} on host re-join`);
        }
      }

      socket.join(room.id);
      socket.emit('roomJoined', room);
      this.broadcastRoomUpdate(room.id);
      return;
    }

    if (room.players.length >= room.settings.players && room.settings.players !== null) {
      socket.emit('error', 'Room is full');
      return;
    }

    const safeName = sanitizeName(playerName);
    room.players.push({ id: socket.id, playerId, name: safeName, score: 0 });
    socket.join(room.id);

    socket.emit('roomJoined', room);
    this.broadcastRoomUpdate(room.id);
    this.broadcastRoomList();
    console.log(`${safeName} joined room ${roomId}`);
  }

  leaveRoom(socket, roomId, playerId) {
    const room = this.getRoom(roomId);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.playerId === playerId || p.id === socket.id);
    if (playerIndex !== -1) {
      const player = room.players[playerIndex];
      const isHost = room.hostPlayerId === player.playerId || room.hostId === socket.id;

      if (isHost) {
        this.emitToRoom(roomId, 'roomClosed', { message: 'El anfitrión ha salido. La sala se ha cerrado.' });
        this.deleteRoom(roomId, 'Room deleted (host left)');
      } else {
        room.players.splice(playerIndex, 1);
        if (room.players.length === 0) {
          this.deleteRoom(roomId, 'Room deleted (empty)');
        } else {
          this.broadcastRoomUpdate(roomId);
        }
      }
      socket.leave(roomId);
      this.broadcastRoomList();
    }
  }
}

module.exports = RoomManager;
