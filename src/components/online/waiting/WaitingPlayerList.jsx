const WaitingPlayerList = ({ players, hostId }) => (
  <div className="flex-1 overflow-y-auto mb-6 pr-2">
    <h3 className="text-sm font-bold text-neon-cyan uppercase tracking-widest mb-3 ml-1 drop-shadow-md">Jugadores</h3>
    <div className="space-y-2">
      {players.map((p, i) => (
        <div key={p.id} className="bg-glass p-3 rounded-xl border border-brand-light/10 flex items-center gap-3 hover:border-brand-cyan/40 transition-all">
          <div className="w-8 h-8 rounded-full bg-brand-cyan/20 text-neon-cyan flex items-center justify-center font-bold shadow-neon-cyan border border-brand-cyan/30">
            {i + 1}
          </div>
          <span className="font-bold text-brand-light flex-1 tracking-wide">{p.name}</span>
          {p.id === hostId && (
            <span className="text-[10px] font-bold bg-brand-pink/20 text-neon-pink px-2 py-1 rounded-md uppercase tracking-widest border border-brand-pink/30 shadow-neon-pink">DJ</span>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default WaitingPlayerList;
