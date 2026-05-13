/**
 * Bingo Musical - Game logic handlers
 */

// ---------- Helpers ----------

/** Fisher-Yates shuffle (mutates array) */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate a bingo card grid for one player.
 * Returns a 2-D array of { label, marked: false }.
 */
function generateCard(pool, rows, cols) {
  const needed = rows * cols;
  const picked = shuffle([...pool]).slice(0, needed);
  // Pad with generic labels if pool is smaller than card
  while (picked.length < needed) picked.push(`Celda ${picked.length + 1}`);
  const grid = [];
  for (let r = 0; r < rows; r++) {
    grid.push(picked.slice(r * cols, r * cols + cols).map(label => ({ label, marked: false })));
  }
  return grid;
}

/**
 * Check if a player's card satisfies any enabled pattern.
 * Returns the winning pattern object or null.
 */
function checkWin(card, patterns, customPatterns, rows, cols) {
  const allPatterns = [...patterns, ...customPatterns];

  for (const pattern of allPatterns) {
    if (!pattern.enabled) continue;

    if (pattern.type === 'preset') {
      if (pattern.id === 'horizontal') {
        for (let r = 0; r < rows; r++) {
          if (card[r].every(cell => cell.marked)) return pattern;
        }
      } else if (pattern.id === 'vertical') {
        for (let c = 0; c < cols; c++) {
          if (card.every(row => row[c].marked)) return pattern;
        }
      } else if (pattern.id === 'diagonal') {
        // Main diagonal
        const mainDiag = rows === cols && card.every((row, i) => row[i].marked);
        // Anti diagonal
        const antiDiag = rows === cols && card.every((row, i) => row[cols - 1 - i].marked);
        if (mainDiag || antiDiag) return pattern;
      }
    } else if (pattern.type === 'custom' && Array.isArray(pattern.cells)) {
      // cells is an array of [row, col] pairs
      const allMarked = pattern.cells.every(([r, c]) => card[r]?.[c]?.marked);
      if (allMarked) return pattern;
    }
  }
  return null;
}

// ---------- Handler ----------

function setupGameHandlers(socket, roomManager) {

  socket.on('startGame', ({ roomId, cardItems }) => {
    const room = roomManager.getRoom(roomId);
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length < 1) return;

    const settings = room.settings;
    const { rows, cols } = settings.matrixSize || { rows: 3, cols: 3 };

    // Use card items provided by client (already filtered by selected genres)
    const pool = (cardItems && cardItems.length > 0) ? cardItems : ['Celda'];

    // Generate one card per player
    const cards = {};
    room.players.forEach(p => {
      cards[p.playerId] = generateCard(pool, rows, cols);
    });

    room.status = 'playing';
    room.gameData = {
      state: 'playing',
      cards,
      winner: null,
      winnerName: null,
      winningPattern: null,
      currentSongIndex: -1   // DJ controls this
    };

    roomManager.emitToRoom(roomId, 'gameStarted', room);
    console.log(`Bingo started in room ${roomId} | ${rows}x${cols} | ${room.players.length} players`);
  });

  socket.on('markCell', ({ roomId, row, col }) => {
    const room = roomManager.getRoom(roomId);
    if (!room || !room.gameData || room.gameData.state !== 'playing') return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    const card = room.gameData.cards[player.playerId];
    if (!card || !card[row] || !card[row][col]) return;

    // Toggle the cell
    card[row][col].marked = !card[row][col].marked;

    const settings = room.settings;
    const { rows, cols } = settings.matrixSize || { rows: 3, cols: 3 };
    const patterns = settings.winningPatterns || [];
    const customPatterns = settings.customPatterns || [];

    const winningPattern = checkWin(card, patterns, customPatterns, rows, cols);

    if (winningPattern) {
      room.gameData.state = 'finished';
      room.gameData.winner = player.playerId;
      room.gameData.winnerName = player.name;
      room.gameData.winningPattern = winningPattern;
      console.log(`BINGO! ${player.name} won in room ${roomId} with pattern: ${winningPattern.name}`);
    }

    roomManager.emitToRoom(roomId, 'gameDataUpdated', room.gameData);
  });

  socket.on('nextSong', ({ roomId }) => {
    const room = roomManager.getRoom(roomId);
    if (!room || !room.gameData || room.hostId !== socket.id) return;

    room.gameData.currentSongIndex = (room.gameData.currentSongIndex || 0) + 1;
    roomManager.emitToRoom(roomId, 'gameDataUpdated', room.gameData);
  });

  socket.on('resetGame', ({ roomId }) => {
    const room = roomManager.getRoom(roomId);
    if (room && room.hostId === socket.id) {
      room.gameData = null;
      room.status = 'waiting';
      roomManager.emitToRoom(roomId, 'gameReset', room);
      roomManager.broadcastRoomList();
    }
  });
}

module.exports = { setupGameHandlers };
