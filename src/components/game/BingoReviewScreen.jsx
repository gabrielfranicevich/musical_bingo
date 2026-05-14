/**
 * BingoReviewScreen — shown when gameState === 'reviewing'.
 *
 * Props:
 *   review:        { claimantId, claimantName, claimantCard, winningPattern, currentSongIndex }
 *   isHost:        bool
 *   resolveReview: (accepted: bool) => void
 */
const BingoReviewScreen = ({ review, isHost, resolveReview }) => {
  if (!review) return null;

  const { claimantName, claimantCard, winningPattern } = review;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-brand-surface border-2 border-brand-pink rounded-3xl shadow-neon-pink w-full max-w-sm flex flex-col gap-4 p-6 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="text-center">
          <span className="text-3xl">⚠️</span>
          <h2 className="text-xl font-black text-brand-white tracking-wider mt-1">
            ¡BINGO cantado!
          </h2>
          <p className="text-xs text-brand-light/60 uppercase tracking-widest font-bold mt-0.5">
            Revisando...
          </p>
        </div>

        {/* Claimant info */}
        <div className="bg-black/30 rounded-2xl px-4 py-3 text-center border border-brand-pink/30">
          <p className="text-sm text-brand-light/60 font-semibold uppercase tracking-wider">
            Supuesto ganador
          </p>
          <p className="text-2xl font-black text-brand-pink drop-shadow-[0_0_8px_rgba(255,8,68,0.7)] mt-1">
            {claimantName}
          </p>
          {winningPattern && (
            <p className="text-xs text-brand-cyan/70 font-bold mt-1 uppercase tracking-wider">
              Patrón: {winningPattern.name}
            </p>
          )}
        </div>

        {/* Claimant card (read-only) */}
        {claimantCard && (
          <div>
            <p className="text-xs text-brand-light/50 text-center uppercase tracking-widest font-bold mb-2">
              Cartón del jugador
            </p>
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${claimantCard[0]?.length || 3}, minmax(0, 1fr))` }}
            >
              {claimantCard.map((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={[
                      'flex items-center justify-center rounded-lg text-center text-[0.55rem] leading-tight font-semibold p-1 min-h-[2.5rem] border',
                      cell.marked
                        ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-[0_0_8px_rgba(0,242,254,0.4)]'
                        : 'bg-white/5 border-brand-light/10 text-brand-light/50',
                    ].join(' ')}
                  >
                    {cell.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Host controls */}
        {isHost ? (
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-xs text-brand-light/50 text-center uppercase tracking-widest font-bold">
              Decisión del host
            </p>
            <button
              id="review-accept-btn"
              onClick={() => resolveReview(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-teal-400 text-brand-dark font-black tracking-widest uppercase text-sm hover:opacity-90 active:scale-95 transition-all shadow-neon-cyan"
            >
              ✅ Válido — ¡BINGO!
            </button>
            <button
              id="review-reject-btn"
              onClick={() => resolveReview(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-pink to-red-600 text-white font-black tracking-widest uppercase text-sm hover:opacity-90 active:scale-95 transition-all shadow-neon-pink"
            >
              ❌ Rechazar
            </button>
          </div>
        ) : (
          <div className="text-center py-4 text-brand-light/50 text-sm font-bold animate-pulse">
            ⏳ Esperando decisión del host...
          </div>
        )}
      </div>
    </div>
  );
};

export default BingoReviewScreen;
