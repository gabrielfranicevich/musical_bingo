import { memo } from 'react';
import { Users, ChevronUp, ChevronDown } from '../Icons';

const PlayerCounter = ({
  count,
  onIncrement,
  onDecrement,
  min,
  max,
  label = "Jugadores",
  subLabel = "",
  accordion = true,
  expanded = true,
  onToggleExpand
}) => {
  const displayCount = count === '∞' ? '∞' : count;
  const isMin = count <= min;
  const isMax = count >= max;

  const CounterControls = () => (
    <div className="flex items-center gap-4">
      <button
        onClick={onDecrement}
        disabled={isMin}
        className="w-12 h-12 rounded-xl bg-glass border border-brand-light/20 text-brand-light font-bold text-2xl hover:border-brand-cyan hover:shadow-neon-cyan transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center"
      >
        -
      </button>
      <div className="flex-1 text-center">
        <div className="text-5xl font-bold text-neon-cyan drop-shadow-lg">{displayCount}</div>
      </div>
      <button
        onClick={onIncrement}
        disabled={isMax}
        className="w-12 h-12 rounded-xl bg-glass border border-brand-light/20 text-brand-light font-bold text-2xl hover:border-brand-pink hover:shadow-neon-pink transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center"
      >
        +
      </button>
    </div>
  );

  if (!accordion) {
    return (
      <div className="bg-glass p-2 rounded-2xl border border-brand-light/10">
        <CounterControls />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between p-4 bg-glass rounded-2xl hover:bg-white/5 transition-all border border-brand-light/20 active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="bg-brand-cyan/20 p-2 rounded-lg text-brand-cyan shadow-neon-cyan">
            <Users size={20} />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-brand-light leading-tight">{label}</h2>
            <span className="text-xs text-brand-light/50 font-bold uppercase tracking-wide">{subLabel || `${count} personas`}</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={24} className="text-brand-light/70" /> : <ChevronDown size={24} className="text-brand-light/70" />}
      </button>
      {expanded && (
        <div className="mt-4 p-4 bg-black/20 rounded-2xl border border-brand-light/5">
          <CounterControls />
        </div>
      )}
    </div>
  );
};

export default memo(PlayerCounter);
