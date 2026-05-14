import { useEffect } from 'react';
import BingoCard from '../game/BingoCard';
import HostDJPanel from '../game/HostDJPanel';
import BingoReviewScreen from '../game/BingoReviewScreen';
import SoundEqualizer from '../game/SoundEqualizer';
import SpotifyAutoPlay from '../game/SpotifyAutoPlay';

const OnlinePlayingScreen = ({
  roomData,
  playerId,
  leaveRoom,
  isHost,
  resetGame,
  markCell,
  nextSong,
  resolveReview,
}) => {
  const myPlayer = roomData.players.find(p => p.playerId === playerId) || {};
  const gameData = roomData.gameData || {};
  const gameState = gameData.state || 'playing';
  const myCard = gameData.cards?.[myPlayer.playerId] || null;
  const selectedGenres = roomData.settings?.selectedGenres || ['basico'];
  const currentSongIndex = gameData.currentSongIndex ?? -1;
  const currentSpotifyId = gameData.currentSpotifyId || null;
  const isRemote = roomData.settings?.type === 'remote';

  const gameStarted = currentSongIndex >= 0;
  const isPlaying = gameState === 'playing' && gameStarted;
  const isReviewing = gameState === 'reviewing';
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
    <div className="relative z-10 h-full flex flex-col overflow-hidden">

      {/* Review overlay */}
      {isReviewing && (
        <BingoReviewScreen
          review={gameData.review}
          isHost={isHost}
          resolveReview={resolveReview}
        />
      )}

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="flex items-center px-4 pt-4 pb-2 shrink-0">
        <button
          id="leave-room-btn"
          onClick={leaveRoom}
          className="flex items-center gap-1 text-brand-light/40 hover:text-brand-pink transition-colors font-bold text-sm px-2 py-1 rounded-lg hover:bg-brand-pink/10 active:scale-95"
        >
          ← Salir
        </button>
      </div>

      {/* ── Scrollable content ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3">

        {/* Host DJ panel (includes hidden Spotify iframe + equalizer) */}
        {isHost && (
          <HostDJPanel
            selectedGenres={selectedGenres}
            currentSongIndex={currentSongIndex}
            onNextSong={nextSong}
          />
        )}

        {/* Equalizer for non-host players while a song is playing */}
        {!isHost && isPlaying && (
          <div className="w-full flex flex-col items-center gap-3 bg-glass rounded-2xl border border-brand-light/10 py-6 px-4">
            <SoundEqualizer active size="lg" />
            <p className="text-xs text-brand-light/50 uppercase tracking-widest font-bold animate-pulse">
              ♫ Escuchá la música y marca tu casilla
            </p>
          </div>
        )}

        {/* Non-host: waiting for DJ to start */}
        {!isHost && !gameStarted && !finished && (
          <div className="w-full flex flex-col items-center gap-3 bg-glass rounded-2xl border border-brand-light/10 py-6 px-4">
            <SoundEqualizer active={false} size="lg" />
            <span className="text-xs text-brand-light/60 font-semibold tracking-wide">
              Esperando que el DJ empiece…
            </span>
          </div>
        )}

        {/* Spotify auto-play for Remote mode (non-host) */}
        {!isHost && isRemote && (
          <SpotifyAutoPlay spotifyId={currentSpotifyId} isRemote={isRemote} />
        )}

        {/* Bingo card — disabled before game starts or after win/review */}
        {myCard && (
          <BingoCard
            card={myCard}
            onMarkCell={markCell}
            disabled={!gameStarted || finished || isReviewing}
            winnerName={finished ? gameData.winnerName : null}
            isHost={isHost}
            onReset={resetGame}
            onLeave={leaveRoom}
          />
        )}

        {!myCard && (
          <div className="flex-1 flex items-center justify-center text-brand-light/40 text-sm">
            Cargando cartón…
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlinePlayingScreen;
