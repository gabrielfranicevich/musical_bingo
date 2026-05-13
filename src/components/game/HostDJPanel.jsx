import { useMemo, useState, useEffect, useRef } from 'react';
import { THEMES } from '../../data/constants';

/**
 * HostDJPanel — shown only to the host during gameplay.
 *
 * Uses the Spotify IFrame API to programmatically control playback.
 * This allows "autoplay" when the host clicks "Siguiente" or "Empezar",
 * which satisfies browser user-gesture requirements.
 */
const HostDJPanel = ({ selectedGenres = ['basico'], onNextSong }) => {
  const [localIndex, setLocalIndex] = useState(-1);
  const containerRef = useRef(null);
  const controllerRef = useRef(null);

  const songQueue = useMemo(() => {
    const all = selectedGenres.flatMap(g => THEMES[g] || []);
    return [...all].sort(() => Math.random() - 0.5);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenres.join(',')]);

  const hasStarted = localIndex >= 0;
  const isFinished = localIndex >= songQueue.length;
  const currentSong = songQueue[localIndex] ?? null;
  const nextSong    = songQueue[localIndex + 1] ?? null;

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create a dedicated div for Spotify to replace (so React doesn't lose track of the container)
    const targetDiv = document.createElement('div');
    containerRef.current.appendChild(targetDiv);

    const initSpotify = (IFrameAPI) => {
      const firstTrackId = songQueue[0]?.spotifyId || '44AyOl4qwyRqmDxYupra5q';
      IFrameAPI.createController(targetDiv, {
        width: '100%',
        height: '80',
        uri: `spotify:track:${firstTrackId}`,
        theme: '0'
      }, (EmbedController) => {
        controllerRef.current = EmbedController;
      });
    };

    if (window.Spotify?.IframeApi) {
      initSpotify(window.Spotify.IframeApi);
    } else {
      const script = document.createElement('script');
      script.src = 'https://open.spotify.com/embed/iframe-api/v1';
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        window.Spotify = window.Spotify || {};
        window.Spotify.IframeApi = IFrameAPI;
        initSpotify(IFrameAPI);
      };
    }

    return () => {
      // Cleanup DOM
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      controllerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleNext = () => {
    const next = localIndex + 1;
    setLocalIndex(next);
    onNextSong();

    const nextTrack = songQueue[next];
    if (controllerRef.current && nextTrack?.spotifyId) {
      // Load the new track URI
      controllerRef.current.loadUri(`spotify:track:${nextTrack.spotifyId}`);
      
      // Play immediately (Spotify's API handles queueing the play command internally)
      controllerRef.current.play();
      
      // Fallback: sometimes the iframe needs a moment if the loadUri takes too long
      setTimeout(() => {
        controllerRef.current?.play();
      }, 500);
    }
  };

  const spotifyUrl = currentSong?.spotifyId
    ? `https://open.spotify.com/track/${currentSong.spotifyId}`
    : null;

  return (
    <div className="w-full rounded-2xl border border-brand-purple/40 bg-glass p-4 flex flex-col gap-4 shadow-neon-pink">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-light/10 pb-2">
        <div className="flex items-center gap-2">
          {hasStarted && !isFinished && (
            <div className="w-5 h-5 rounded-full border border-brand-light/20 flex items-center justify-center animate-spin-slow bg-gradient-to-tr from-gray-900 to-gray-600 shadow-[0_0_8px_rgba(255,8,68,0.6)]">
              <div className="w-1.5 h-1.5 bg-brand-pink rounded-full"></div>
            </div>
          )}
          <span className="text-xs font-bold text-neon-pink uppercase tracking-wider">DJ Deck</span>
        </div>
        {hasStarted && !isFinished && (
          <span className="text-xs text-brand-light/50 font-bold bg-black/30 px-2 py-0.5 rounded-full">
            {localIndex + 1} / {songQueue.length}
          </span>
        )}
      </div>

      {/* Spotify embed container — hidden until started to keep the UI clean */}
      <div className={`${hasStarted && !isFinished ? 'block' : 'hidden'} rounded-xl overflow-hidden shadow-neon-cyan border border-brand-cyan/20`} ref={containerRef}>
        {/* IFrame gets injected here */}
      </div>

      {/* Song label + Spotify link */}
      {hasStarted && currentSong && !isFinished && (
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-brand-light flex-1 truncate drop-shadow-md">
            🎵 {currentSong.label}
          </p>
          {spotifyUrl && (
            <a
              id="dj-open-spotify-btn"
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs font-bold text-brand-cyan hover:text-white hover:shadow-neon-cyan transition-all px-2 py-1 rounded border border-brand-cyan/30 bg-brand-cyan/10"
              title="Abrir en Spotify"
            >
              ↗ Spotify
            </a>
          )}
        </div>
      )}

      {/* Upcoming */}
      {nextSong && !isFinished && (
        <p className="text-[10px] text-brand-light/40 text-center truncate px-2 tracking-widest uppercase">
          A continuación: <span className="text-brand-light/70">{nextSong.label}</span>
        </p>
      )}

      {/* Not started */}
      {!hasStarted && (
        <div className="w-full rounded-xl bg-black/30 py-6 flex flex-col items-center gap-2 border border-brand-light/5">
          <div className="flex items-end gap-1 mb-2 animate-sound-wave">
            <div className="w-1.5 h-4 bg-brand-cyan rounded-full"></div>
            <div className="w-1.5 h-8 bg-brand-pink rounded-full"></div>
            <div className="w-1.5 h-5 bg-brand-purple rounded-full"></div>
            <div className="w-1.5 h-6 bg-brand-cyan rounded-full"></div>
            <div className="w-1.5 h-3 bg-brand-pink rounded-full"></div>
          </div>
          <span className="text-xs text-brand-light/60 text-center px-4 font-semibold tracking-wide">
            LA PISTA ESTÁ VACÍA
          </span>
        </div>
      )}

      {/* Finished */}
      {isFinished && (
        <div className="w-full rounded-xl bg-brand-purple/20 border border-brand-purple py-6 flex flex-col items-center gap-2 shadow-neon-cyan">
          <span className="text-3xl drop-shadow-[0_0_10px_rgba(0,242,254,0.8)]">🎤</span>
          <span className="text-xs text-brand-light font-bold tracking-widest uppercase">Fin de la Playlist</span>
        </div>
      )}

      {/* Progress bar */}
      {hasStarted && !isFinished && songQueue.length > 0 && (
        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-brand-light/10">
          <div
            className="h-full bg-gradient-to-r from-brand-cyan to-brand-pink rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,8,68,0.8)]"
            style={{ width: `${Math.min(100, ((localIndex + 1) / songQueue.length) * 100)}%` }}
          />
        </div>
      )}

      {/* Next button */}
      {!isFinished && (
        <button
          id="dj-next-song-btn"
          onClick={handleNext}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-black tracking-widest uppercase text-sm hover:opacity-90 active:scale-95 transition-all shadow-neon-pink mt-2"
        >
          {!hasStarted ? '▶ Dale Play' : '⏭ Siguiente Track'}
        </button>
      )}
    </div>
  );
};

export default HostDJPanel;

