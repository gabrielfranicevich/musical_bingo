import { useEffect } from 'react';

export const useAppRouting = (screen, setScreen, roomId, setRoomId, roomData) => {
  // Initial URL parsing and popstate listener
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.substring(1);
      const pathUpper = path.toUpperCase();

      if (path === 'offline') {
        setScreen('setup');
      } else if (path === 'online') {
        setScreen('online_lobby');
        if (setRoomId) setRoomId(null);
      } else if (pathUpper && pathUpper.length === 4) {
        if (setRoomId) setRoomId(pathUpper);
        setScreen('online_lobby');
        window.history.replaceState(null, '', '/online');
      } else {
        if (setRoomId) setRoomId(null);
        setScreen('home');
      }
    };

    // Run initial check
    const path = window.location.pathname.substring(1);
    const pathUpper = path.toUpperCase();

    if (path === 'offline') {
      setScreen('setup');
    } else if (path === 'online') {
      setScreen('online_lobby');
    } else if (pathUpper && pathUpper.length === 4) {
      if (setRoomId) setRoomId(pathUpper);
      setScreen('online_lobby');
      window.history.replaceState(null, '', '/online');
    } else if (path) {
      window.history.replaceState(null, '', '/');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setScreen, setRoomId]);

  // Update URL based on state
  useEffect(() => {
    const handleStateChange = () => {
      let targetPath = '/';

      if (screen === 'setup' || screen === 'reveal' || screen === 'playing') {
        targetPath = '/offline';
      } else if ((screen === 'online_waiting' || screen === 'online_playing') && roomData?.id) {
        targetPath = `/${roomData.id}`;
      } else if (screen === 'online_lobby' || screen === 'online_create') {
        targetPath = '/online';
      }

      if (window.location.pathname !== targetPath) {
        if (targetPath === '/' && screen === 'home') return; // Don't push if already home
        window.history.pushState(null, '', targetPath);
      }
    };

    handleStateChange();
  }, [screen, roomData, roomId]);
};
