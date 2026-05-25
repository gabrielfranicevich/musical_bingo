/**
 * BingoReviewScreen — shown when gameState === 'reviewing'.
 *
 * Props:
 *   review:        { claimantId, claimantName, claimantCard, winningPattern, currentSongIndex, songsPlayed }
 *   isHost:        bool
 *   resolveReview: (accepted: bool) => void
 */

/** Extract only the cells that form the winning pattern line. */
function getWinningCells(card, pattern) {
  if (!pattern || !card || card.length === 0) return [];
  const rows = card.length;
  const cols = card[0]?.length || 0;

  if (pattern.type === 'preset') {
    if (pattern.id === 'horizontal') {
      for (let r = 0; r < rows; r++) {
        if (card[r].every(cell => cell.marked)) {
          return card[r].map((cell, c) => ({ ...cell, row: r, col: c }));
        }
      }
    } else if (pattern.id === 'vertical') {
      for (let c = 0; c < cols; c++) {
        if (card.every(row => row[c]?.marked)) {
          return card.map((row, r) => ({ ...row[c], row: r, col: c }));
        }
      }
    } else if (pattern.id === 'diagonal') {
      const mainDiag = rows === cols && card.every((row, i) => row[i]?.marked);
      const antiDiag = rows === cols && card.every((row, i) => row[cols - 1 - i]?.marked);
      if (mainDiag) return card.map((row, i) => ({ ...row[i], row: i, col: i }));
      if (antiDiag) return card.map((row, i) => ({ ...row[cols - 1 - i], row: i, col: cols - 1 - i }));
    }
  } else if (pattern.type === 'custom' && Array.isArray(pattern.cells)) {
    return pattern.cells.map(([r, c]) => ({ ...card[r]?.[c], row: r, col: c }));
  }
  return [];
}

const BingoReviewScreen = ({ review, isHost, resolveReview }) => {
  if (!review) return null;

  const { claimantName, claimantCard, winningPattern } = review;
  const winningCells = getWinningCells(claimantCard, winningPattern);

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

        {/* Winning pattern cells */}
        {winningCells.length > 0 && (
          <div>
            <p className="text-xs text-brand-light/50 text-center uppercase tracking-widest font-bold mb-3">
              🎵 Canciones del patrón ganador
            </p>
            <div className="flex flex-col gap-2">
              {winningCells.map((cell, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-brand-cyan/40 bg-brand-cyan/10 px-4 py-2.5 shadow-[0_0_8px_rgba(0,242,254,0.2)]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-brand-cyan text-base shrink-0">✓</span>
                    <span className="text-sm font-semibold text-brand-white truncate">
                      {cell.label}
                    </span>
                  </div>
                  <span className="text-xs font-black text-brand-cyan/70 uppercase tracking-widest shrink-0 ml-2 bg-black/30 px-2 py-0.5 rounded-lg border border-brand-cyan/20">
                    {cell.markedAtSong !== undefined
                      ? `Canción #${cell.markedAtSong + 1}`
                      : '—'}
                  </span>
                </div>
              ))}
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
