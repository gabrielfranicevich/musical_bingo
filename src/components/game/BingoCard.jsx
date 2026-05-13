/**
 * BingoCard — interactive N×M bingo grid for a player.
 * Props:
 *   card:       2-D array of { label: string, marked: boolean }
 *   onMarkCell: (row, col) => void
 *   disabled:   bool — prevents interaction after win
 *   winnerName: string | null
 */
const BingoCard = ({ card, onMarkCell, disabled = false, winnerName = null }) => {
  if (!card || card.length === 0) return null;
  const rows = card.length;
  const cols = card[0].length;

  return (
    <div className="flex flex-col items-center gap-3 w-full relative">
      {/* Full screen BINGO win effect */}
      {winnerName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-8 bg-brand-cyan opacity-80 animate-confeti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 20}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                  backgroundColor: Math.random() > 0.5 ? 'var(--brand-cyan)' : 'var(--brand-pink)'
                }}
              />
            ))}
          </div>
          <div className="text-center animate-pulse-neon z-10 bg-brand-surface border-2 border-brand-cyan p-8 rounded-3xl shadow-neon-cyan">
            <h1 className="text-7xl font-black text-brand-white tracking-widest drop-shadow-[0_0_15px_rgba(0,242,254,0.8)]">¡BINGO!</h1>
            <p className="text-2xl mt-4 font-bold text-brand-pink drop-shadow-[0_0_10px_rgba(255,8,68,0.8)] uppercase">
              {winnerName}
            </p>
          </div>
        </div>
      )}

      <div
        className="grid gap-1.5 w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {card.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              id={`bingo-cell-${r}-${c}`}
              onClick={() => !disabled && onMarkCell(r, c)}
              disabled={disabled}
              className={[
                'relative flex items-center justify-center rounded-xl border border-brand-light/10 text-center font-semibold transition-all duration-300 select-none overflow-hidden',
                'min-h-[3.5rem] px-1 py-1 text-[0.6rem] leading-tight',
                cell.marked
                  ? 'bingo-cell-selected'
                  : 'bg-glass text-brand-light bingo-cell-hover',
                disabled && !cell.marked ? 'opacity-60 cursor-default' : 'cursor-pointer',
              ].join(' ')}
            >
              {cell.marked && (
                <span className="absolute inset-0 flex items-center justify-center text-4xl text-brand-cyan/20 drop-shadow-md pointer-events-none mix-blend-screen">
                  ✓
                </span>
              )}
              <span className={cell.marked ? 'opacity-90 relative z-10' : 'relative z-10'}>{cell.label}</span>
            </button>
          ))
        )}
      </div>

      <p className="text-xs text-brand-light/40 mt-1 uppercase tracking-widest font-bold">
        Selecciona las casillas de la música 🎵
      </p>
    </div>
  );
};

export default BingoCard;
