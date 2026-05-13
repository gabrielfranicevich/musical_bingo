/**
 * Disconnect handler
 */
function setupDisconnectHandler(socket, roomManager) {

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const rooms = roomManager.rooms; // Access raw rooms object

    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);

      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        player.connected = false;

        // If active game, keep them but mark disconnected
        if (room.status === 'playing' || room.status === 'chat_playing') {
          console.log(`Player disconnected from active game in room ${roomId}. Keeping slot for reconnection.`);
          roomManager.broadcastRoomUpdate(roomId);

          // Auto-resolve stall: if a caught Mono disconnects during mono_guessing
          // and no caught Mono remains connected, civilians win immediately.
          if (room.gameData && room.gameData.state === 'mono_guessing') {
            const caughtMonoIds = room.gameData.caughtMonoIds || [];
            const allCaughtDisconnected = caughtMonoIds.length > 0 &&
              caughtMonoIds.every(monoId => {
                const mono = room.players.find(p => p.playerId === monoId);
                return !mono || mono.connected === false;
              });

            if (allCaughtDisconnected) {
              console.log(`All caught Monos disconnected in room ${roomId}. Auto-resolving: civilians win.`);
              room.gameData.state = 'results';
              room.gameData.monoGuessResult = { guess: '', correct: false, abandoned: true };

              if (room.gameData.escapedMonoIds && room.gameData.escapedMonoIds.length > 0) {
                room.gameData.winner = 'monos';
                room.gameData.winnerNames = room.players
                  .filter(p => room.gameData.escapedMonoIds.includes(p.playerId))
                  .map(p => p.name);
              } else {
                room.gameData.winner = 'civilians';
                room.gameData.winnerNames = room.players
                  .filter(p => !room.gameData.monoIds.includes(p.playerId))
                  .map(p => p.name);
              }

              roomManager.emitToRoom(roomId, 'gameDataUpdated', room.gameData);
            }
          }
        } else {
          // Waiting room logic with grace period
          if (room.hostId === socket.id) {
            console.log(`Host disconnected from room ${roomId}. Starting grace period.`);
            room.hostDisconnected = true;

            // Clear any existing timeout just in case
            if (room.destroyTimeout) clearTimeout(room.destroyTimeout);

            const timeoutId = setTimeout(() => {
              if (rooms[roomId] && rooms[roomId].hostId === socket.id && !rooms[roomId].players.find(p => p.id === socket.id && p.connected)) {
                roomManager.emitToRoom(roomId, 'roomClosed', { message: 'El anfitrión ha salido. La sala se ha cerrado.' });
                roomManager.deleteRoom(roomId, 'Room deleted (host timeout)');
              }
            }, 30000); // 30 seconds to reconnect

            // Make timeout non-enumerable to prevent serialization crash
            Object.defineProperty(room, 'destroyTimeout', {
              value: timeoutId,
              writable: true,
              configurable: true,
              enumerable: false
            });
          } else {
            // Regular player disconnected
            console.log(`Player disconnected from room ${roomId}. Starting grace period.`);

            if (player.disconnectTimeout) clearTimeout(player.disconnectTimeout);

            const pTimeoutId = setTimeout(() => {
              // Re-fetch room to ensure it still exists
              const currentRoom = roomManager.getRoom(roomId);
              if (currentRoom && currentRoom.status === 'waiting') {
                const idx = currentRoom.players.findIndex(p => p.playerId === player.playerId);
                if (idx !== -1 && !currentRoom.players[idx].connected) {
                  currentRoom.players.splice(idx, 1);
                  console.log(`Player removed from room ${roomId} (timeout)`);
                  roomManager.broadcastRoomUpdate(roomId);

                  if (currentRoom.players.length === 0) {
                    roomManager.deleteRoom(roomId, 'Room deleted (empty)');
                  }
                }
              }
            }, 30000); // 30 seconds to reconnect

            // Make timeout non-enumerable
            Object.defineProperty(player, 'disconnectTimeout', {
              value: pTimeoutId,
              writable: true,
              configurable: true,
              enumerable: false
            });
          }
          roomManager.broadcastRoomUpdate(roomId);
        }
        break;
      }
    }
  });
}

module.exports = { setupDisconnectHandler };
