import { Users, MessageSquare } from '../../Icons';

const RoomStats = ({ currentPlayers, maxPlayers, gameType }) => (
  <div className="bg-glass p-4 rounded-2xl border border-brand-light/10 mb-6 text-center shadow-neon-purple">
    <div className="flex items-center justify-center gap-4 text-brand-light font-bold">
      <div className="flex items-center gap-2">
        <Users size={20} className="text-neon-cyan" />
        <span>{currentPlayers}/{maxPlayers === 2 ? '∞' : maxPlayers}</span>
      </div>
      <div className="w-px h-6 bg-brand-light/20"></div>
      <div className="flex items-center gap-2">
        {gameType === 'chat' ? <MessageSquare size={20} className="text-neon-pink" /> : <Users size={20} className="text-neon-pink" />}
        <span className="uppercase text-sm tracking-widest">{gameType === 'chat' ? 'Chat' : 'En Persona'}</span>
      </div>
    </div>
  </div>
);

export default RoomStats;
