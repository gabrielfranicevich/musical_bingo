import { useEffect, useRef } from 'react';

/**
 * SpotifyAutoPlay — auto-plays tracks for non-host players in Remote mode.
 * Rendered as a compact (hidden height) iframe that reloads when spotifyId changes.
 *
 * Props:
 *   spotifyId:  string | null — current Spotify track ID
 *   isRemote:   bool          — only renders in 'remote' mode
 */
const SpotifyAutoPlay = ({ spotifyId, isRemote }) => {
  const containerRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    if (!isRemote || !containerRef.current) return;

    const targetDiv = document.createElement('div');
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(targetDiv);

    const initSpotify = (IFrameAPI) => {
      const trackId = spotifyId || '44AyOl4qwyRqmDxYupra5q';
      IFrameAPI.createController(
        targetDiv,
        { width: '100%', height: '80', uri: `spotify:track:${trackId}`, theme: '0' },
        (EmbedController) => {
          controllerRef.current = EmbedController;
          EmbedController.play();
        }
      );
    };

    if (window.Spotify?.IframeApi) {
      initSpotify(window.Spotify.IframeApi);
    } else {
      const existing = document.getElementById('spotify-iframe-api-script');
      if (!existing) {
        const script = document.createElement('script');
        script.id = 'spotify-iframe-api-script';
        script.src = 'https://open.spotify.com/embed/iframe-api/v1';
        script.async = true;
        document.body.appendChild(script);
      }
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
  // Re-run when spotifyId changes to load the new track
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotifyId, isRemote]);

  if (!isRemote || !spotifyId) return null;

  return (
    <div
      ref={containerRef}
      className="absolute overflow-hidden"
      style={{ width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
};

export default SpotifyAutoPlay;
