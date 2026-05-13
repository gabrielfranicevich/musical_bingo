const InPersonGameView = ({ gameData, roomData, isHost, onReset }) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white/50 p-4 rounded-2xl border-2 border-brand-wood/10 mb-4">
        {gameData.playerOrderIds?.map((pid, idx) => {
          const p = roomData.players.find(pl => pl.playerId === pid);
          if (!p) return null;
          return (
            <div key={pid} className={`flex items-center gap-3 p-3 rounded-xl mb-2 'bg-white text-brand-wood/60'`}>
              <div className="font-bold">{idx + 1}.</div>
              <div className="font-bold flex-1">{p.name}</div>
            </div>
          );
        })}
      </div>
      {isHost && (
        <button onClick={onReset} className="w-full bg-brand-wood text-white py-4 rounded-xl font-bold">TERMINAR</button>
      )}
    </div>
  );
};

export default InPersonGameView;
