import { useState, useEffect } from 'react';
import { ArrowLeft, Users } from '../Icons';
import JoinGameForm from './lobby/JoinGameForm';
import GameCodeInput from './lobby/GameCodeInput';
import GameListSection from './lobby/GameListSection';
import PrimaryButton from '../shared/PrimaryButton';

const OnlineLobbyScreen = ({ setScreen, onlineGames = [], lanGames = [],
  joinOnlineGame, playerName,
  setPlayerName, roomIdFromUrl, clearRoomId, socket, getRandomName, localIp }) => {
  const [roomStatus, setRoomStatus] = useState(null);
  const [checkingRoom, setCheckingRoom] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [lanGamesExpanded, setLanGamesExpanded] = useState(true);
  const [onlineGamesExpanded, setOnlineGamesExpanded] = useState(true);

  const targetRoomId = roomIdFromUrl || selectedRoomId;

  // Request LAN games when connected
  useEffect(() => {
    if (socket) {
      socket.emit('requestLanGames', { localIp });
    }
  }, [socket, localIp]);

  // Check room status when targetRoomId changes
  useEffect(() => {
    if (targetRoomId && socket) {
      setCheckingRoom(true);
      socket.emit('checkRoom', { roomId: targetRoomId });

      const handleRoomStatus = (status) => {
        setRoomStatus(status);
        setCheckingRoom(false);
      };

      socket.on('roomStatus', handleRoomStatus);

      return () => {
        socket.off('roomStatus', handleRoomStatus);
      };
    } else {
      setRoomStatus(null);
    }
  }, [targetRoomId, socket]);

  const safeLanGames = Array.isArray(lanGames) ? lanGames : [];
  const lanGameIds = new Set(safeLanGames.map(g => g.id));
  const safeOnlineGames = (Array.isArray(onlineGames) ? onlineGames : [])
    .filter(g => !lanGameIds.has(g.id));
  const showDirectJoin = !!roomIdFromUrl || !!selectedRoomId;



  return (
    <div className="p-6 relative z-10 h-full flex flex-col">
      <div className="relative mb-6 flex items-center justify-center">
        <button
          onClick={() => {
            if (showDirectJoin) {
              if (roomIdFromUrl && clearRoomId) {
                clearRoomId();
              } else {
                setSelectedRoomId(null);
              }
            } else {
              setScreen('home');
              window.history.pushState(null, '', '/');
            }
          }}
          className="absolute left-0 p-2 rounded-xl hover:bg-white/10 text-brand-light transition-all active:scale-95"
          title="Volver al inicio"
        >
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-2xl font-black text-brand-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          {showDirectJoin ? 'UNIRSE A PARTIDA' : 'PARTIDAS ONLINE'}
        </h1>
      </div>

      {showDirectJoin ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <JoinGameForm
            checkingRoom={checkingRoom}
            roomStatus={roomStatus}
            targetRoomId={targetRoomId}
            playerName={playerName}
            setPlayerName={setPlayerName}
            joinOnlineGame={joinOnlineGame}
            getRandomName={getRandomName}
          />
        </div>
      ) : (
        <>
          {/* Game Code Input - Fixed at top, always visible */}
          <GameCodeInput onJoin={setSelectedRoomId} />

          {/* Scrollable game lists */}
          <div className="flex-1 mb-6 overflow-y-auto">
            {/* LAN Games Section */}
            <GameListSection
              title="Partidas LAN Disponibles"
              subtitle={`${safeLanGames.length} partida${safeLanGames.length !== 1 ? 's' : ''} en tu red`}
              icon={<Users size={20} />}
              games={safeLanGames}
              isExpanded={lanGamesExpanded}
              onToggle={() => setLanGamesExpanded(!lanGamesExpanded)}
              onJoin={setSelectedRoomId}
              headerClassName="bg-brand-cyan/20"
            />

            {/* All Online Games Section */}
            <GameListSection
              title="Partidas Disponibles"
              icon={<Users size={20} />}
              games={safeOnlineGames}
              isExpanded={onlineGamesExpanded}
              onToggle={() => setOnlineGamesExpanded(!onlineGamesExpanded)}
              onJoin={setSelectedRoomId}
            />
          </div>

          <PrimaryButton
            onClick={() => setScreen('online_create')}
          >
            <div className="bg-black/40 p-1 rounded-lg">
              <Users size={24} />
            </div>
            CREAR PARTIDA
          </PrimaryButton>
        </>
      )}
    </div>
  );
};

export default OnlineLobbyScreen;
