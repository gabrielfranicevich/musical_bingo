import { useState } from 'react';
import { GENRES, DEFAULT_PATTERNS } from '../../../data/constants';

/**
 * BingoAdvancedSettings — shown only to the host in the waiting room.
 * Allows configuring:
 *   - Genres (selectedGenres)
 *   - Matrix size (matrixSize: { rows, cols })
 *   - Winning patterns (winningPatterns + customPatterns)
 */
const BingoAdvancedSettings = ({ settings, onUpdateSettings }) => {
  const [open, setOpen] = useState(false);
  const [patternEditorOpen, setPatternEditorOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState(null); // null = new
  const [patternName, setPatternName] = useState('');
  const [patternCells, setPatternCells] = useState([]); // array of [r,c]

  const selectedGenres = settings.selectedGenres || ['basico'];
  const matrixSize = settings.matrixSize || { rows: 3, cols: 3 };
  const winningPatterns = settings.winningPatterns || DEFAULT_PATTERNS;
  const customPatterns = settings.customPatterns || [];

  // --- Genre toggle ---
  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length === 1) return; // at least one
      onUpdateSettings({ selectedGenres: selectedGenres.filter(g => g !== genre) });
    } else {
      onUpdateSettings({ selectedGenres: [...selectedGenres, genre] });
    }
  };

  // --- Matrix size ---
  const setRows = (delta) => {
    const rows = Math.max(1, Math.min(8, matrixSize.rows + delta));
    const newWinningPatterns = rows !== matrixSize.cols 
      ? winningPatterns.map(p => p.id === 'diagonal' ? { ...p, enabled: false } : p)
      : winningPatterns;
    onUpdateSettings({ matrixSize: { ...matrixSize, rows }, customPatterns: [], winningPatterns: newWinningPatterns });
  };
  const setCols = (delta) => {
    const cols = Math.max(1, Math.min(8, matrixSize.cols + delta));
    const newWinningPatterns = matrixSize.rows !== cols 
      ? winningPatterns.map(p => p.id === 'diagonal' ? { ...p, enabled: false } : p)
      : winningPatterns;
    onUpdateSettings({ matrixSize: { ...matrixSize, cols }, customPatterns: [], winningPatterns: newWinningPatterns });
  };

  // --- Preset patterns ---
  const togglePresetPattern = (id) => {
    const updated = winningPatterns.map(p =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );
    onUpdateSettings({ winningPatterns: updated });
  };

  // --- Pattern editor ---
  const openNewPattern = () => {
    setEditingPattern(null);
    setPatternName('');
    setPatternCells([]);
    setPatternEditorOpen(true);
  };

  const openEditPattern = (p) => {
    setEditingPattern(p);
    setPatternName(p.name);
    setPatternCells(p.cells);
    setPatternEditorOpen(true);
  };

  const toggleEditorCell = (r, c) => {
    const key = `${r},${c}`;
    const exists = patternCells.some(([pr, pc]) => pr === r && pc === c);
    if (exists) {
      setPatternCells(patternCells.filter(([pr, pc]) => !(pr === r && pc === c)));
    } else {
      setPatternCells([...patternCells, [r, c]]);
    }
  };

  const savePattern = () => {
    if (!patternName.trim() || patternCells.length === 0) return;
    const newPattern = {
      id: editingPattern?.id || `custom_${Date.now()}`,
      name: patternName.trim(),
      type: 'custom',
      cells: patternCells,
      enabled: true,
    };
    let updated;
    if (editingPattern) {
      updated = customPatterns.map(p => p.id === editingPattern.id ? newPattern : p);
    } else {
      updated = [...customPatterns, newPattern];
    }
    onUpdateSettings({ customPatterns: updated });
    setPatternEditorOpen(false);
  };

  const deletePattern = (id) => {
    onUpdateSettings({ customPatterns: customPatterns.filter(p => p.id !== id) });
  };

  const toggleCustomPattern = (id) => {
    const updated = customPatterns.map(p =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );
    onUpdateSettings({ customPatterns: updated });
  };

  const isCellInEditor = (r, c) =>
    patternCells.some(([pr, pc]) => pr === r && pc === c);

  return (
    <div className="w-full rounded-2xl border border-brand-light/10 bg-glass overflow-hidden mb-6">
      {/* Header toggle */}
      <button
        id="bingo-advanced-toggle"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-4 text-sm font-bold text-brand-light hover:bg-white/5 transition-colors active:scale-[0.98]"
      >
        <span className="flex items-center gap-2 tracking-widest uppercase text-neon-cyan"><span className="text-lg">⚙️</span> Configuración Avanzada</span>
        <span className="text-brand-light/40 text-lg">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-6 border-t border-brand-light/10 mt-2">

          {/* Genres */}
          <div>
            <p className="text-xs font-bold text-brand-light/60 uppercase tracking-widest mb-3 pt-2 drop-shadow-sm">Géneros Musicales</p>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={[
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border uppercase tracking-wider',
                    selectedGenres.includes(g)
                      ? 'bg-brand-pink/20 border-brand-pink text-brand-white shadow-neon-pink'
                      : 'bg-black/30 border-brand-light/20 text-brand-light/60 hover:border-brand-cyan/50 hover:text-brand-cyan'
                  ].join(' ')}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Matrix size */}
          <div>
            <p className="text-xs font-bold text-brand-light/60 uppercase tracking-widest mb-3 drop-shadow-sm">Dimensiones del Cartón</p>
            <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-brand-light/5">
              {/* Rows stepper */}
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs text-brand-light/50 font-bold uppercase">Filas</label>
                <div className="flex items-center gap-1">
                  <button
                    id="matrix-rows-minus"
                    onClick={() => setRows(-1)}
                    disabled={matrixSize.rows <= 1}
                    className="w-7 h-7 rounded-lg border border-brand-light/20 bg-black/40 text-neon-cyan font-black text-base flex items-center justify-center disabled:opacity-30 hover:border-brand-cyan/60 active:scale-90 transition-all"
                  >−</button>
                  <span id="matrix-rows-value" className="w-7 text-center text-sm font-black text-neon-cyan">{matrixSize.rows}</span>
                  <button
                    id="matrix-rows-plus"
                    onClick={() => setRows(1)}
                    disabled={matrixSize.rows >= 8}
                    className="w-7 h-7 rounded-lg border border-brand-light/20 bg-black/40 text-neon-cyan font-black text-base flex items-center justify-center disabled:opacity-30 hover:border-brand-cyan/60 active:scale-90 transition-all"
                  >+</button>
                </div>
              </div>
              <span className="text-brand-light/40 font-bold text-xl mt-4">×</span>
              {/* Cols stepper */}
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs text-brand-light/50 font-bold uppercase">Cols</label>
                <div className="flex items-center gap-1">
                  <button
                    id="matrix-cols-minus"
                    onClick={() => setCols(-1)}
                    disabled={matrixSize.cols <= 1}
                    className="w-7 h-7 rounded-lg border border-brand-light/20 bg-black/40 text-neon-cyan font-black text-base flex items-center justify-center disabled:opacity-30 hover:border-brand-cyan/60 active:scale-90 transition-all"
                  >−</button>
                  <span id="matrix-cols-value" className="w-7 text-center text-sm font-black text-neon-cyan">{matrixSize.cols}</span>
                  <button
                    id="matrix-cols-plus"
                    onClick={() => setCols(1)}
                    disabled={matrixSize.cols >= 8}
                    className="w-7 h-7 rounded-lg border border-brand-light/20 bg-black/40 text-neon-cyan font-black text-base flex items-center justify-center disabled:opacity-30 hover:border-brand-cyan/60 active:scale-90 transition-all"
                  >+</button>
                </div>
              </div>
              <span className="text-xs text-brand-light/40 mt-4 uppercase tracking-widest flex-1 text-right">= {matrixSize.rows * matrixSize.cols} casillas</span>
            </div>
          </div>

          {/* Preset patterns */}
          <div>
            <p className="text-xs font-bold text-brand-light/60 uppercase tracking-widest mb-3 drop-shadow-sm">Patrones Ganadores</p>
            <div className="flex flex-col gap-2">
              {winningPatterns
                .filter(p => p.id !== 'diagonal' || matrixSize.rows === matrixSize.cols)
                .map(p => (
                <label key={p.id} className="flex items-center gap-3 cursor-pointer select-none bg-black/20 p-2 rounded-xl border border-brand-light/5 hover:border-brand-cyan/30 transition-colors">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${p.enabled ? 'bg-brand-cyan border-brand-cyan shadow-neon-cyan' : 'bg-black/50 border-brand-light/20'}`}>
                    {p.enabled && <span className="text-black text-xs font-black">✓</span>}
                  </div>
                  <input
                    type="checkbox"
                    checked={p.enabled}
                    onChange={() => togglePresetPattern(p.id)}
                    className="hidden"
                  />
                  <span className={`text-sm font-bold tracking-wide ${p.enabled ? 'text-brand-white' : 'text-brand-light/60'}`}>{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom patterns */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-brand-light/60 uppercase tracking-widest drop-shadow-sm">Patrones Extra</p>
              <button
                id="add-custom-pattern-btn"
                onClick={openNewPattern}
                className="text-xs font-bold text-neon-pink hover:text-brand-white transition-colors bg-brand-pink/10 px-2 py-1 rounded border border-brand-pink/30"
              >
                + NUEVO
              </button>
            </div>

            {customPatterns.length === 0 && (
              <p className="text-xs text-brand-light/30 italic text-center p-4 bg-black/20 rounded-xl border border-brand-light/5">Sin patrones extra</p>
            )}

            <div className="flex flex-col gap-2">
              {customPatterns.map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-brand-light/5 hover:border-brand-cyan/30 transition-colors">
                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${p.enabled ? 'bg-brand-cyan border-brand-cyan shadow-neon-cyan' : 'bg-black/50 border-brand-light/20'}`}>
                      {p.enabled && <span className="text-black text-xs font-black">✓</span>}
                    </div>
                    <input
                      type="checkbox"
                      checked={p.enabled}
                      onChange={() => toggleCustomPattern(p.id)}
                      className="hidden"
                    />
                    <span className={`text-sm font-bold tracking-wide ${p.enabled ? 'text-brand-white' : 'text-brand-light/60'}`}>{p.name}</span>
                  </label>
                  <button onClick={() => openEditPattern(p)} className="text-xs text-brand-cyan hover:text-white transition-colors px-2">✏️</button>
                  <button onClick={() => deletePattern(p.id)} className="text-xs text-brand-pink hover:text-white transition-colors px-2">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pattern editor modal */}
      {patternEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-brand-surface rounded-3xl border border-brand-cyan/40 p-6 w-full max-w-sm flex flex-col gap-5 shadow-neon-cyan">
            <h3 className="font-black text-neon-cyan text-center tracking-widest uppercase text-lg">
              {editingPattern ? 'Editar Patrón' : 'Nuevo Patrón'}
            </h3>

            <input
              id="pattern-name-input"
              type="text"
              placeholder="Nombre del patrón..."
              value={patternName}
              onChange={e => setPatternName(e.target.value)}
              className="w-full rounded-xl border border-brand-cyan/30 bg-black/50 px-4 py-3 text-sm text-brand-white focus:outline-none focus:border-brand-cyan focus:shadow-neon-cyan"
            />

            <p className="text-xs text-brand-light/60 text-center tracking-wide">
              Hacé click en las casillas para marcar el diseño
            </p>

            {/* Mini grid preview */}
            <div
              className="grid gap-1.5 mx-auto bg-black/30 p-3 rounded-xl border border-brand-light/10"
              style={{
                gridTemplateColumns: `repeat(${matrixSize.cols}, 2rem)`,
              }}
            >
              {Array.from({ length: matrixSize.rows }, (_, r) =>
                Array.from({ length: matrixSize.cols }, (_, c) => (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => toggleEditorCell(r, c)}
                    className={[
                      'w-8 h-8 rounded-lg border text-xs font-bold transition-all flex items-center justify-center',
                      isCellInEditor(r, c)
                        ? 'bg-brand-pink/20 border-brand-pink text-brand-white shadow-[inset_0_0_8px_rgba(255,8,68,0.5)]'
                        : 'bg-black/50 border-brand-light/10 text-transparent hover:border-brand-cyan/40',
                    ].join(' ')}
                  >
                    {isCellInEditor(r, c) ? '✓' : ''}
                  </button>
                ))
              )}
            </div>

            <p className="text-[10px] uppercase tracking-widest text-center text-brand-pink font-bold">
              {patternCells.length} casillas activas
            </p>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setPatternEditorOpen(false)}
                className="flex-1 py-3 rounded-xl border border-brand-light/20 text-brand-light/60 text-xs tracking-widest uppercase font-bold hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                id="save-pattern-btn"
                onClick={savePattern}
                disabled={!patternName.trim() || patternCells.length === 0}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white text-xs tracking-widest uppercase font-black disabled:opacity-30 active:scale-95 transition-all shadow-neon-pink border border-brand-pink/50"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BingoAdvancedSettings;
