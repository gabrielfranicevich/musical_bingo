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
 * Calculate how many enabled winning patterns pass through each (row, col).
 * Returns a 2-D array of counts.
 */
function calcWinPaths(rows, cols, patterns, customPatterns) {
  const paths = Array.from({ length: rows }, () => new Array(cols).fill(0));

  const allPatterns = [...patterns, ...customPatterns].filter(p => p.enabled);

  for (const pattern of allPatterns) {
    if (pattern.type === 'preset') {
      if (pattern.id === 'horizontal') {
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++) paths[r][c]++;
      } else if (pattern.id === 'vertical') {
        for (let c = 0; c < cols; c++)
          for (let r = 0; r < rows; r++) paths[r][c]++;
      } else if (pattern.id === 'diagonal' && rows === cols) {
        for (let i = 0; i < rows; i++) {
          paths[i][i]++;
          paths[i][cols - 1 - i]++;
        }
      }
    } else if (pattern.type === 'custom' && Array.isArray(pattern.cells)) {
      pattern.cells.forEach(([r, c]) => {
        if (paths[r]?.[c] !== undefined) paths[r][c]++;
      });
    }
  }
  return paths;
}

/**
 * Generate a bingo card grid for one player using weighted assignment.
 * Positions with more win-paths get lower-difficulty items.
 * Returns a 2-D array of { label, spotifyId?, difficulty, marked: false }.
 */
function generateCard(pool, rows, cols, patterns, customPatterns) {
  const needed = rows * cols;

  // Enrich pool items: ensure each has a difficulty
  const enriched = pool.map(item => {
    if (typeof item === 'string') return { label: item, difficulty: 5 };
    return { ...item, difficulty: item.difficulty ?? 5 };
  });

  // Shuffle pool and pick `needed` items
  const picked = shuffle([...enriched]).slice(0, needed);
  while (picked.length < needed) {
    picked.push({ label: `Celda ${picked.length + 1}`, difficulty: 5 });
  }

  // Calculate winPaths per position
  const winPaths = calcWinPaths(rows, cols, patterns || [], customPatterns || []);

  // Build flat list of positions sorted by winPaths descending (most strategic first)
  const positions = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      positions.push({ r, c, paths: winPaths[r][c] });
  positions.sort((a, b) => b.paths - a.paths);

  // Sort items ascending by difficulty (easiest items → most strategic positions)
  const sortedItems = [...picked].sort((a, b) => a.difficulty - b.difficulty);

  // Assign: position[0] (most strategic) gets sortedItems[0] (easiest)
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(null));
  positions.forEach((pos, idx) => {
    const item = sortedItems[idx];
    grid[pos.r][pos.c] = { ...item, marked: false };
  });

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
        const mainDiag = rows === cols && card.every((row, i) => row[i].marked);
        const antiDiag = rows === cols && card.every((row, i) => row[cols - 1 - i].marked);
        if (mainDiag || antiDiag) return pattern;
      }
    } else if (pattern.type === 'custom' && Array.isArray(pattern.cells)) {
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
    const patterns = settings.winningPatterns || [];
    const customPatterns = settings.customPatterns || [];

    // Use card items provided by client (already filtered by selected genres)
    const pool = (cardItems && cardItems.length > 0) ? cardItems : ['Celda'];

    // Generate one card per player using weighted assignment
    const cards = {};
    room.players.forEach(p => {
      cards[p.playerId] = generateCard(pool, rows, cols, patterns, customPatterns);
    });

    room.status = 'playing';
    room.gameData = {
      state: 'playing',
      cards,
      winner: null,
      winnerName: null,
      winningPattern: null,
      currentSongIndex: -1,   // DJ controls this
      currentSpotifyId: null,
      marksThisSong: {},       // playerId -> true if already marked this song
      review: null,
      songsPlayed: [],
    };

    roomManager.emitToRoom(roomId, 'gameStarted', room);
    console.log(`Bingo started in room ${roomId} | ${rows}x${cols} | ${room.players.length} players`);
  });

  socket.on('markCell', ({ roomId, row, col }) => {
    const room = roomManager.getRoom(roomId);
    if (!room || !room.gameData || room.gameData.state !== 'playing') return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    // One mark per song enforcement
    if (room.gameData.marksThisSong[player.playerId]) {
      console.log(`Player ${player.name} tried to mark again this song — ignored`);
      return;
    }

    const card = room.gameData.cards[player.playerId];
    if (!card || !card[row] || !card[row][col]) return;

    // Toggle the cell
    card[row][col].marked = !card[row][col].marked;

    // Record that this player has marked for this song
    if (card[row][col].marked) {
      room.gameData.marksThisSong[player.playerId] = true;
    }

    const settings = room.settings;
    const { rows, cols } = settings.matrixSize || { rows: 3, cols: 3 };
    const patterns = settings.winningPatterns || [];
    const customPatterns = settings.customPatterns || [];

    const winningPattern = checkWin(card, patterns, customPatterns, rows, cols);

    if (winningPattern) {
      // Transition to 'reviewing' instead of 'finished'
      room.gameData.state = 'reviewing';
      room.gameData.review = {
        claimantId: player.playerId,
        claimantName: player.name,
        claimantCard: card.map(r => r.map(c => ({ ...c }))), // deep copy
        winningPattern,
        songsPlayed: room.gameData.songsPlayed || [],
      };
      console.log(`BINGO claimed by ${player.name} in room ${roomId} — entering review`);
    }

    roomManager.emitToRoom(roomId, 'gameDataUpdated', room.gameData);
  });

  socket.on('resolveReview', ({ roomId, accepted }) => {
    const room = roomManager.getRoom(roomId);
    if (!room || !room.gameData || room.gameData.state !== 'reviewing') return;
    if (room.hostId !== socket.id) return; // Only host can resolve

    if (accepted) {
      const { claimantId, claimantName, winningPattern } = room.gameData.review;
      room.gameData.state = 'finished';
      room.gameData.winner = claimantId;
      room.gameData.winnerName = claimantName;
      room.gameData.winningPattern = winningPattern;
      room.gameData.review = null;
      console.log(`BINGO validated for ${claimantName} in room ${roomId}`);
    } else {
      // Reject: unmark the last cell that triggered the win and go back to playing
      const { claimantId, claimantCard, winningPattern } = room.gameData.review;
      // Restore the card to the snapshot (which has the winning mark already applied)
      // Find the winning cells and unmark the one most recently marked.
      // Simple approach: unmark the first winning cell found
      if (winningPattern && winningPattern.type === 'preset') {
        const card = room.gameData.cards[claimantId];
        // Unmark by finding first marked cell in the winning pattern
        const settings = room.settings;
        const { rows, cols } = settings.matrixSize || { rows: 3, cols: 3 };
        outer: for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (card[r][c].marked) {
              card[r][c].marked = false;
              break outer;
            }
          }
        }
      } else if (winningPattern && winningPattern.type === 'custom' && Array.isArray(winningPattern.cells)) {
        const card = room.gameData.cards[claimantId];
        const [r, c] = winningPattern.cells[0];
        if (card[r]?.[c]) card[r][c].marked = false;
      }
      // Also remove the mark-lock so the player can mark again next song
      delete room.gameData.marksThisSong[claimantId];
      room.gameData.state = 'playing';
      room.gameData.review = null;
      console.log(`BINGO rejected in room ${roomId} — continuing game`);
    }

    roomManager.emitToRoom(roomId, 'gameDataUpdated', room.gameData);
  });

  socket.on('nextSong', ({ roomId, spotifyId }) => {
    const room = roomManager.getRoom(roomId);
    if (!room || !room.gameData || room.hostId !== socket.id) return;

    room.gameData.currentSongIndex = (room.gameData.currentSongIndex || 0) + 1;
    room.gameData.marksThisSong = {}; // Reset per-song mark tracking
    if (spotifyId) {
      room.gameData.currentSpotifyId = spotifyId;
      // Track songs played for review context
      room.gameData.songsPlayed = [
        ...(room.gameData.songsPlayed || []),
        { songIndex: room.gameData.currentSongIndex, spotifyId }
      ];
    }
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
