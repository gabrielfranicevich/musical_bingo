import { useEffect } from 'react';
import WaitingRoomHeader from './waiting/WaitingRoomHeader';
import RoomStats from './waiting/RoomStats';
import WaitingPlayerList from './waiting/WaitingPlayerList';
import StartGameButton from './waiting/StartGameButton';
import BingoAdvancedSettings from './waiting/BingoAdvancedSettings';

const OnlineWaitingRoom = ({ roomData, isHost, leaveRoom, startGame, updateRoomSettings }) => {
  const currentPlayers = roomData.players.length;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && isHost && currentPlayers >= 1) {
        startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHost, currentPlayers, startGame]);

  return (
    <div className="p-6 relative z-10 h-full flex flex-col gap-4">
      <WaitingRoomHeader
        roomName={roomData.roomName}
        roomId={roomData.id}
        onLeave={leaveRoom}
      />

      <RoomStats
        currentPlayers={currentPlayers}
        maxPlayers={roomData.settings.players}
        gameType={roomData.settings.type}
      />

      {isHost && (
        <BingoAdvancedSettings
          settings={roomData.settings}
          onUpdateSettings={updateRoomSettings}
        />
      )}

      <WaitingPlayerList
        players={roomData.players}
        hostId={roomData.hostId}
      />

      <StartGameButton
        isHost={isHost}
        onStart={startGame}
        playerCount={currentPlayers}
      />
    </div>
  );
};

export default OnlineWaitingRoom;
