const fs = require('fs');
const path = require('path');
const gameData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/gameData.json'), 'utf8'));
const THEMES = gameData.THEMES;

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

function validateItem(room, spotifyId, label) {
  if (!spotifyId || !label) return false;
  
  // 1. Check built-in THEMES
  for (const genre in THEMES) {
    const song = THEMES[genre].find(s => s.spotifyId === spotifyId);
    if (song && Array.isArray(song.chart_items)) {
      if (song.chart_items.some(item => item.toLowerCase() === label.toLowerCase())) return true;
    }
  }

  // 2. Check contributed themes
  if (room && room.contributedThemes) {
    for (const theme of room.contributedThemes) {
      if (Array.isArray(theme.songs)) {
        const song = theme.songs.find(s => s.spotifyId === spotifyId);
        if (song && Array.isArray(song.chart_items)) {
          if (song.chart_items.some(item => item.toLowerCase() === label.toLowerCase())) return true;
        }
      }
    }
  }

  return false;
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

function getMarkForSong(card, songIndex) {
  for (const row of card) {
    for (const cell of row) {
      if (cell.marked && cell.markedForSong === songIndex) return cell;
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
      transitionTime: 0,
      songsPlayed: [],
    };

    roomManager.emitToRoom(roomId, 'gameStarted', room);
    console.log(`Bingo started in room ${roomId} | ${rows}x${cols} | ${room.players.length} players`);
  });

  socket.on('markCell', ({ roomId, row, col, clientOffset }) => {
    const room = roomManager.getRoom(roomId);
    if (!room || !room.gameData || room.gameData.state !== 'playing') return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    const card = room.gameData.cards[player.playerId];
    if (!card || !card[row] || !card[row][col]) return;

    const isCurrentlyMarked = card[row][col].marked;
    const currentSongIndex = room.gameData.currentSongIndex;

    // Check Win Helper (reusable)
    const settings = room.settings;
    const { rows, cols } = settings.matrixSize || { rows: 3, cols: 3 };
    const patterns = settings.winningPatterns || [];
    const customPatterns = settings.customPatterns || [];

    if (isCurrentlyMarked) {
      // Allow unmarking anytime
      card[row][col].marked = false;
      delete card[row][col].markedForSong;
      delete card[row][col].checkedDuringWindow;
      
      // If they unmark, verify if they lost their pending win
      if (player.pendingWinTime) {
        if (!checkWin(card, patterns, customPatterns, rows, cols)) {
          delete player.pendingWinTime;
        }
      }
      roomManager.emitToRoom(roomId, 'gameDataUpdated', room.gameData);
      return;
    }

    // --- MARKING LOGIC ---
    if (currentSongIndex < 0) return; // Game hasn't really started

    const serverOffset = Date.now() - (room.gameData.transitionTime || 0);
    let effectiveOffset = clientOffset;
    if (typeof clientOffset !== 'number' || Math.abs(clientOffset - serverOffset) > 2000) {
      effectiveOffset = serverOffset;
    }

    const inGracePeriod = effectiveOffset <= 3500;
    const prevSongIndex = currentSongIndex - 1;

    let assignedSongIndex = currentSongIndex;

    if (inGracePeriod && currentSongIndex > 0) {
      const hasMarkForPrev = getMarkForSong(card, prevSongIndex) !== null;
      
      if (!hasMarkForPrev) {
        // Smart first-click assignment
        const prevSongId = room.gameData.songsPlayed[prevSongIndex]?.spotifyId;
        const currSongId = room.gameData.currentSpotifyId;
        
        const validPrev = validateItem(room, prevSongId, card[row][col].label);
        const validCurr = validateItem(room, currSongId, card[row][col].label);
        
        if (validCurr && !validPrev) {
          assignedSongIndex = currentSongIndex;
        } else {
          assignedSongIndex = prevSongIndex; // Defaults to prev if valid for both or neither
        }
      } else {
        assignedSongIndex = currentSongIndex;
      }
    }

    // Check if they already have a mark for the assigned song
    if (getMarkForSong(card, assignedSongIndex) !== null) {
      console.log(`Player ${player.name} already checked an item for song ${assignedSongIndex}`);
      return; // Deny
    }

    // Apply mark
    card[row][col].marked = true;
    card[row][col].markedForSong = assignedSongIndex;
    card[row][col].checkedDuringWindow = currentSongIndex;

    // Check for win
    const winningPattern = checkWin(card, patterns, customPatterns, rows, cols);
    if (winningPattern && !player.pendingWinTime) {
      player.pendingWinTime = Date.now();
      // We don't declare win immediately. We wait until nextSong for cleanup & validation.
      console.log(`Player ${player.name} got a pending win at ${player.pendingWinTime}`);
    }

    roomManager.emitToRoom(roomId, 'gameDataUpdated', room.gameData);
  });

  socket.on('nextSong', ({ roomId, spotifyId, label }) => {
    const room = roomManager.getRoom(roomId);
    if (!room || !room.gameData || room.hostId !== socket.id) return;
    if (room.gameData.state === 'finished') return;

    const prevSongIndex = room.gameData.currentSongIndex;
    
    // --- CLEANUP PHASE ---
    if (prevSongIndex >= 0) {
      room.players.forEach(p => {
        const card = room.gameData.cards[p.playerId];
        if (!card) return;
        
        // Find cells checked during the window that just ended
        for (const row of card) {
          for (const cell of row) {
            if (cell.marked && cell.checkedDuringWindow === prevSongIndex) {
              const targetSong = room.gameData.songsPlayed[cell.markedForSong];
              const isValid = targetSong && validateItem(room, targetSong.spotifyId, cell.label);
              if (!isValid) {
                console.log(`Cleanup: unmarking invalid item '${cell.label}' for player ${p.name}`);
                cell.marked = false;
                delete cell.markedForSong;
                delete cell.checkedDuringWindow;
              }
            }
          }
        }

        // Re-verify pending wins after cleanup
        if (p.pendingWinTime) {
          const settings = room.settings;
          const { rows, cols } = settings.matrixSize || { rows: 3, cols: 3 };
          const patterns = settings.winningPatterns || [];
          const customPatterns = settings.customPatterns || [];
          
          if (!checkWin(card, patterns, customPatterns, rows, cols)) {
            console.log(`Cleanup: revoked pending win for player ${p.name}`);
            delete p.pendingWinTime;
          }
        }
      });
      
      // --- DECLARE WINNER ---
      // Find the player with the earliest pendingWinTime
      let winner = null;
      let earliestTime = Infinity;
      
      room.players.forEach(p => {
        if (p.pendingWinTime && p.pendingWinTime < earliestTime) {
          earliestTime = p.pendingWinTime;
          winner = p;
        }
      });
      
      if (winner) {
        const settings = room.settings;
        const { rows, cols } = settings.matrixSize || { rows: 3, cols: 3 };
        const card = room.gameData.cards[winner.playerId];
        const winningPattern = checkWin(card, settings.winningPatterns || [], settings.customPatterns || [], rows, cols);
        
        room.gameData.state = 'finished';
        room.gameData.winner = winner.playerId;
        room.gameData.winnerName = winner.name;
        room.gameData.winningPattern = winningPattern;
        console.log(`BINGO validated for ${winner.name} in room ${roomId}`);
        roomManager.emitToRoom(roomId, 'gameDataUpdated', room.gameData);
        return; // Stop here, game is over!
      }
    }

    // --- TRANSITION PHASE ---
    room.gameData.currentSongIndex = prevSongIndex + 1;
    room.gameData.transitionTime = Date.now();
    
    if (spotifyId) {
      room.gameData.currentSpotifyId = spotifyId;
      room.gameData.songsPlayed = [
        ...(room.gameData.songsPlayed || []),
        { songIndex: room.gameData.currentSongIndex, spotifyId, label }
      ];
    }
    roomManager.emitToRoom(roomId, 'gameDataUpdated', room.gameData);
  });

  socket.on('nextSong', ({ roomId, spotifyId, label }) => {
    const room = roomManager.getRoom(roomId);
    if (!room || !room.gameData || room.hostId !== socket.id) return;

    room.gameData.currentSongIndex = (room.gameData.currentSongIndex || 0) + 1;
    room.gameData.marksThisSong = {}; // Reset per-song mark tracking
    if (spotifyId) {
      room.gameData.currentSpotifyId = spotifyId;
      // Track songs played for review context
      room.gameData.songsPlayed = [
        ...(room.gameData.songsPlayed || []),
        { songIndex: room.gameData.currentSongIndex, spotifyId, label }
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
