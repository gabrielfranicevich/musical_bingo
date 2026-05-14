import { useMemo, useState, useEffect, useRef } from 'react';
import { THEMES } from '../../data/constants';
import SoundEqualizer from './SoundEqualizer';

/**
 * HostDJPanel — shown only to the host during gameplay.
 *
 * Uses the Spotify IFrame API to programmatically control playback.
 * The iframe is kept in the DOM (hidden, 1px) so audio continues playing;
 * the visible area shows the SoundEqualizer instead.
 */
const HostDJPanel = ({ selectedGenres = ['basico'], onNextSong }) => {
  const [localIndex, setLocalIndex] = useState(-1);
  const containerRef = useRef(null);
  const controllerRef = useRef(null);
  const handleNextRef = useRef(null); // stable ref to avoid stale closures

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

        // Auto-advance when a track finishes playing
        EmbedController.addListener('playback_update', (e) => {
          if (
            e?.data?.duration > 0 &&
            e?.data?.position >= e?.data?.duration - 1000 &&
            !e?.data?.isPaused
          ) {
            handleNextRef.current?.();
          }
        });
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
      if (containerRef.current) containerRef.current.innerHTML = '';
      controllerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleNext = () => {
    const next = localIndex + 1;
    setLocalIndex(next);
    const nextTrack = songQueue[next];
    onNextSong(nextTrack?.spotifyId || null);
    if (controllerRef.current && nextTrack?.spotifyId) {
      controllerRef.current.loadUri(`spotify:track:${nextTrack.spotifyId}`);
      controllerRef.current.play();
      setTimeout(() => { controllerRef.current?.play(); }, 500);
    }
  };

  // Keep ref in sync so the playback_update listener avoids stale closure
  handleNextRef.current = handleNext;

  return (
    <div className="w-full rounded-2xl border border-brand-purple/40 bg-glass p-4 flex flex-col gap-4 shadow-neon-pink">

      {/* Hidden Spotify iframe — stays in DOM for audio, invisible to user */}
      <div
        ref={containerRef}
        className="absolute overflow-hidden"
        style={{ width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-light/10 pb-2">
        <div className="flex items-center gap-2">
          {hasStarted && !isFinished && (
            <div className="w-5 h-5 rounded-full border border-brand-light/20 flex items-center justify-center animate-spin-slow bg-gradient-to-tr from-gray-900 to-gray-600 shadow-[0_0_8px_rgba(255,8,68,0.6)]">
              <div className="w-1.5 h-1.5 bg-brand-pink rounded-full" />
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

      {/* Not started — static (inactive) equalizer */}
      {!hasStarted && (
        <div className="w-full rounded-xl bg-black/30 py-5 flex flex-col items-center gap-3 border border-brand-light/5">
          <SoundEqualizer active={false} size="lg" />
          <span className="text-xs text-brand-light/60 text-center px-4 font-semibold tracking-wide">
            LA PISTA ESTÁ VACÍA
          </span>
        </div>
      )}

      {/* Playing — animated equalizer + progress */}
      {hasStarted && !isFinished && (
        <>
          <div className="w-full rounded-xl bg-black/30 py-5 flex flex-col items-center gap-2 border border-brand-light/5">
            <SoundEqualizer active size="lg" />
          </div>

          {songQueue.length > 0 && (
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-brand-light/10">
              <div
                className="h-full bg-gradient-to-r from-brand-cyan to-brand-pink rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,8,68,0.8)]"
                style={{ width: `${Math.min(100, ((localIndex + 1) / songQueue.length) * 100)}%` }}
              />
            </div>
          )}
        </>
      )}

      {/* Finished */}
      {isFinished && (
        <div className="w-full rounded-xl bg-brand-purple/20 border border-brand-purple py-6 flex flex-col items-center gap-2 shadow-neon-cyan">
          <span className="text-3xl drop-shadow-[0_0_10px_rgba(0,242,254,0.8)]">🎤</span>
          <span className="text-xs text-brand-light font-bold tracking-widest uppercase">Fin de la Playlist</span>
        </div>
      )}

      {/* Play / Next button */}
      {!isFinished && (
        <button
          id="dj-next-song-btn"
          onClick={handleNext}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-black tracking-widest uppercase text-sm hover:opacity-90 active:scale-95 transition-all shadow-neon-pink"
        >
          {!hasStarted ? '▶ Dale Play' : '⏭ Siguiente Track'}
        </button>
      )}
    </div>
  );
};

export default HostDJPanel;
