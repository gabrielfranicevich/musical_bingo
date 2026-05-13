import { useEffect, useRef } from 'react';
import { Users, MessageSquare } from '../../Icons';

const JoinGameForm = ({
  checkingRoom,
  roomStatus,
  targetRoomId,
  playerName,
  setPlayerName,
  joinOnlineGame,
  getRandomName
}) => {
  const inputRef = useRef(null);

  // Focus input when showing the join form
  useEffect(() => {
    if (roomStatus && roomStatus.room && !checkingRoom && inputRef.current) {
      inputRef.current.focus();
    }
  }, [roomStatus, checkingRoom]);

  if (checkingRoom) {
    return (
      <div className="text-center text-brand-wood font-bold">
        Verificando sala...
      </div>
    );
  }

  if (roomStatus && !roomStatus.exists) {
    return (
      <div className="bg-white p-6 rounded-3xl border-4 border-brand-wood shadow-[8px_8px_0px_0px_rgba(93,64,55,1)] w-full text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-brand-wood mb-2">{roomStatus.error}</h2>
        <p className="text-brand-wood/60 mb-4">La sala "{targetRoomId}" no existe</p>
      </div>
    );
  }

  if (roomStatus && roomStatus.full) {
    return (
      <div className="bg-white p-6 rounded-3xl border-4 border-brand-wood shadow-[8px_8px_0px_0px_rgba(93,64,55,1)] w-full text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-brand-wood mb-2">{roomStatus.error}</h2>
        <p className="text-brand-wood/60 mb-4">No puedes unirte a esta sala</p>
      </div>
    );
  }

  if (roomStatus && roomStatus.room) {
    const handleJoin = () => {
      let finalName = playerName.trim();
      if (!finalName) {
        finalName = getRandomName();
        setPlayerName(finalName);
      }
      joinOnlineGame(targetRoomId, finalName);
    };

    return (
      <div className="bg-white p-6 rounded-3xl border-4 border-brand-wood shadow-[8px_8px_0px_0px_rgba(93,64,55,1)] w-full text-center">
        <h2 className="text-2xl font-bold text-brand-wood mb-2">
          {roomStatus.room.roomName}
        </h2>
        <div className="flex justify-center gap-4 text-brand-wood/60 font-bold uppercase text-sm mb-6">
          <span className="flex items-center gap-1"><Users size={16} /> {roomStatus.room.players.length}/{roomStatus.room.settings.players}</span>
          <span className="flex items-center gap-1">
            {roomStatus.room.settings.type === 'chat' ? <MessageSquare size={16} /> : <Users size={16} />}
            {roomStatus.room.settings.type === 'chat' ? 'Chat' : 'Persona'}
          </span>
        </div>

        <div className="space-y-4 text-left">
          <label className="text-sm font-bold text-brand-wood uppercase tracking-wider ml-1">Tu Nombre</label>
          <input
            ref={inputRef}
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Ingresa tu nombre"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleJoin();
              }
            }}
            className="w-full p-4 border-2 border-brand-wood/20 rounded-2xl focus:border-brand-bronze focus:outline-none bg-brand-beige/30 text-brand-wood font-bold text-lg text-center"
          />

          <button
            onClick={handleJoin}
            className="w-full bg-brand-mustard text-white py-4 rounded-xl font-bold text-xl shadow-[4px_4px_0px_0px_#5D4037] hover:translate-y-[-2px] active:translate-y-1 transition-all border-2 border-brand-wood"
          >
            ENTRAR
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default JoinGameForm;
