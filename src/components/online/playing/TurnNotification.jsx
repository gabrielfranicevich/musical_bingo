const TurnNotification = ({ isMyTurn, gamePhase, gameType }) => {
  if (gamePhase === 'playing' && gameType === 'chat' && isMyTurn) {
    return (
      <div className="mb-4 bg-brand-mustard p-3 rounded-xl shadow-md border-2 border-brand-wood animate-pulse">
        <div className="text-white font-bold text-xl uppercase tracking-widest text-center">
          ¡ES TU TURNO!
        </div>
      </div>
    );
  }
  return null;
};

export default TurnNotification;
