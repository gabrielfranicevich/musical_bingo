const ChatGameView = ({
  gameData,
  roomData,
  isMyTurn,
  currentTurnPlayer,

}) => {
  return (
    <div className="flex-NONE">
      {gameData.hints?.length > 0 &&
        <div className="mb-4 p-4 bg-white rounded-2xl border-2 border-brand-wood text-center shadow-sm relative overflow-hidden">
          {gameData.hints?.map((hintItem, idx) => {
            const player = roomData.players.find(pl => pl.playerId === hintItem.playerId);
            if (!player) return null;

            return (
              <p key={idx} className="mb-2 text-brand-wood">
                <span className="font-bold">{player.name}: </span>
                <span className="opacity-60">{hintItem.text}</span>
              </p>
            );
          })}
        </div>
      }
      {isMyTurn ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmitHint()}
            placeholder="Escribe tu pista..."
            autoFocus
            className="flex-1 p-4 border-2 border-brand-wood/20 rounded-xl focus:border-brand-bronze focus:outline-none bg-white text-brand-wood font-bold"
          />
          <button
            onClick={onSubmitHint}
            disabled={!hint.trim()}
            className="px-6 bg-brand-bronze text-white rounded-xl font-bold shadow-[2px_2px_0px_0px_#5D4037] active:translate-y-0.5 active:shadow-none transition-all"
          >
            Enviar
          </button>
        </div>
      ) : (
        <div className="bg-brand-wood/10 rounded-xl p-4 text-center font-bold text-brand-wood/60 animate-pulse">
          Esperando a {currentTurnPlayer?.name || '...'}...
        </div>
      )}
    </div>
  );
};

export default ChatGameView;
