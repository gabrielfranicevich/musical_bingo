import { useState, useEffect } from 'react';
import './App.css';
import HomeScreen from './components/HomeScreen';
import OnlineLobbyScreen from './components/online/OnlineLobbyScreen';
import OnlineCreateScreen from './components/online/OnlineCreateScreen';
import OnlineWaitingRoom from './components/online/OnlineWaitingRoom';
import OnlinePlayingScreen from './components/online/OnlinePlayingScreen';

import HelpModal from './components/shared/HelpModal';
import { Info } from './components/Icons';

import { useSessionId } from './hooks/useSessionId';
import { useLocalIp } from './hooks/useLocalIp';
import { useOnlineGame } from './hooks/useOnlineGame';
import { useAppRouting } from './hooks/useAppRouting';
import { useShared } from './hooks/game/useShared';

function App() {
  const [screen, setScreen] = useState('home');
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Persist playerName
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('playerName') || '';
  });

  useEffect(() => {
    if (playerName) {
      localStorage.setItem('playerName', playerName);
    }
  }, [playerName]);

  // Hooks
  const mySessionId = useSessionId();
  const localIp = useLocalIp();
  const shared = useShared();
  const onlineGame = useOnlineGame(setScreen, mySessionId, localIp, playerName);

  // Routing hook consumes state
  useAppRouting(screen, setScreen, onlineGame.roomId, onlineGame.setRoomId, onlineGame.roomData);

  return (
    <div className="min-h-screen p-4 flex items-center justify-center font-sans text-brand-light selection:bg-brand-cyan selection:text-black">
      <div className="w-full max-w-md bg-glass rounded-3xl shadow-neon-purple overflow-hidden border border-brand-purple/50 relative">
        <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-brand-cyan/30 shadow-[0_0_5px_rgba(0,242,254,0.5)]"></div>
        <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-brand-pink/30 shadow-[0_0_5px_rgba(255,8,68,0.5)]"></div>
        <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-brand-purple/30 shadow-[0_0_5px_rgba(178,36,239,0.5)]"></div>

        <button
          onClick={() => setHelpModalOpen(true)}
          className="absolute top-4 right-4 z-50 p-2 rounded-xl text-brand-light/40 hover:text-brand-cyan hover:bg-brand-cyan/10 transition-all active:scale-95"
          title="Ayuda"
        >
          <Info size={28} />
        </button>

        {screen === 'home' && <HomeScreen setScreen={setScreen} />}

        {screen === 'online_lobby' && (
          <OnlineLobbyScreen
            setScreen={setScreen}
            onlineGames={onlineGame.onlineGames}
            lanGames={onlineGame.lanGames}
            joinOnlineGame={onlineGame.joinOnlineGame}
            playerName={playerName}
            setPlayerName={setPlayerName}
            roomIdFromUrl={onlineGame.roomId}
            clearRoomId={() => onlineGame.setRoomId(null)}
            socket={onlineGame.socket}
            getRandomName={shared.getRandomName} // en shared
            localIp={localIp}
          />
        )}

        {screen === 'online_create' && (
          <OnlineCreateScreen
            setScreen={setScreen}
            newGameSettings={onlineGame.newGameSettings}
            setNewGameSettings={onlineGame.setNewGameSettings}
            onlineGames={onlineGame.onlineGames}
            setOnlineGames={onlineGame.setOnlineGames}
            playerNames={shared.playerNames}
            createOnlineGame={onlineGame.createOnlineGame}
            playerName={playerName}
            setPlayerName={setPlayerName}
            getRandomName={shared.getRandomName}
          />
        )}

        {screen === 'online_waiting' && onlineGame.roomData && (
          <OnlineWaitingRoom
            roomData={onlineGame.roomData}
            isHost={onlineGame.isHost}
            leaveRoom={onlineGame.leaveRoom}
            startGame={onlineGame.startOnlineGame}
            updateRoomSettings={onlineGame.updateRoomSettings}
          />
        )}

        {screen === 'online_playing' && onlineGame.roomData && (
          <OnlinePlayingScreen
            roomData={onlineGame.roomData}
            playerId={mySessionId}
            leaveRoom={onlineGame.leaveRoom}
            isHost={onlineGame.isHost}
            resetGame={onlineGame.resetOnlineGame}
            markCell={onlineGame.markCell}
            nextSong={onlineGame.nextSong}
          />
        )}

        <HelpModal
          isOpen={helpModalOpen}
          onClose={() => setHelpModalOpen(false)}
          screen={screen}
          isHost={onlineGame?.isHost || false}
        />
      </div>
    </div>
  );
}

export default App;
