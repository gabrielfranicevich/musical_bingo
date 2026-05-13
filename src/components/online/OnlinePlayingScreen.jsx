import { useEffect } from 'react';
import BingoCard from '../game/BingoCard';
import HostDJPanel from '../game/HostDJPanel';

const OnlinePlayingScreen = ({
  roomData,
  playerId,
  leaveRoom,
  isHost,
  resetGame,
  markCell,
  nextSong,
}) => {
  const myPlayer = roomData.players.find(p => p.playerId === playerId) || {};
  const gameData = roomData.gameData || {};
  const gameState = gameData.state || 'playing';
  const myCard = gameData.cards?.[myPlayer.playerId] || null;
  const selectedGenres = roomData.settings?.selectedGenres || ['basico'];
  const currentSongIndex = gameData.currentSongIndex ?? -1;

  const iWon = gameData.winner === myPlayer.playerId;
  const finished = gameState === 'finished';

  // Enter → reset (host only, when finished)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && finished && isHost) resetGame();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [finished, isHost, resetGame]);

  return (
    <div className="p-4 relative z-10 h-full flex flex-col gap-3 overflow-y-auto">

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-brand-wood/50 font-semibold uppercase tracking-wider">
            🎵 Bingo Musical
          </span>
          <span className="text-xs text-brand-wood/40">{roomData.roomName}</span>
        </div>
        <button
          id="leave-room-btn"
          onClick={leaveRoom}
          className="text-xs text-brand-wood/40 hover:text-red-500 font-bold transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
        >
          Salir
        </button>
      </div>

      {/* Win banner */}
      {finished && (
        <div className={[
          'w-full rounded-2xl py-3 px-4 text-center font-extrabold text-sm shadow-md',
          iWon
            ? 'bg-gradient-to-r from-brand-mustard to-amber-400 text-brand-dark animate-bounce'
            : 'bg-white/60 border-2 border-brand-wood/10 text-brand-wood'
        ].join(' ')}>
          {iWon
            ? `🎉 ¡BINGO! ¡Ganaste con "${gameData.winningPattern?.name}"!`
            : `🏆 ${gameData.winnerName} hizo BINGO con "${gameData.winningPattern?.name}"`
          }
        </div>
      )}

      {/* Host DJ panel */}
      {isHost && (
        <HostDJPanel
          selectedGenres={selectedGenres}
          currentSongIndex={currentSongIndex}
          onNextSong={nextSong}
        />
      )}

      {/* Bingo card */}
      {myCard && (
        <BingoCard
          card={myCard}
          onMarkCell={markCell}
          disabled={finished}
          winnerName={finished ? gameData.winnerName : null}
        />
      )}

      {!myCard && (
        <div className="flex-1 flex items-center justify-center text-brand-wood/40 text-sm">
          Cargando cartón...
        </div>
      )}

      {/* Reset button (host, finished) */}
      {finished && isHost && (
        <button
          id="reset-game-btn"
          onClick={resetGame}
          className="w-full py-3 rounded-2xl bg-brand-wood text-brand-cream font-extrabold text-sm tracking-wide hover:bg-brand-wood/80 active:scale-95 transition-all mt-1"
        >
          🔄 Nueva partida
        </button>
      )}
    </div>
  );
};

export default OnlinePlayingScreen;
