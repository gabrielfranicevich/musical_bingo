import { Users, MessageSquare } from '../../Icons';

const GameItem = ({ game, onJoin }) => {
  return (
    <button
      onClick={() => {
        if (game.status === 'waiting') {
          onJoin(game.id);
        }
      }}
      disabled={game.status !== 'waiting'}
      className={`w-full text-left bg-glass p-4 rounded-2xl border-2 border-brand-cyan/30 shadow-neon-pink flex items-center justify-between group transition-all cursor-pointer ${game.status === 'waiting'
        ? 'hover:border-brand-bronze hover:translate-x-1 focus:border-brand-cyan focus:translate-x-1 focus:outline-none'
        : 'opacity-70 cursor-not-allowed'
        }`}
    >
      <div>
        <h3 className="font-bold text-lg text-brand-light">{game.name}</h3>
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-brand-light/60 mt-1">
          <span className="flex items-center gap-1">
            <Users size={14} /> {game.players}/{game.maxPlayers === 2 ? '∞' : game.maxPlayers}
          </span>
          <span className="flex items-center gap-1">
            {game.type === 'chat' ? <MessageSquare size={14} /> : <Users size={14} />}
            {game.type === 'chat' ? 'Por Chat' : 'En Persona'}
          </span>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${game.status === 'waiting'
        ? 'bg-brand-pastel-mint text-brand-light'
        : 'bg-brand-wood/10 text-brand-light/50'
        }`}>
        {game.status === 'waiting' ? 'Unirse' : 'Jugando'}
      </div>
    </button>
  );
};

export default GameItem;
