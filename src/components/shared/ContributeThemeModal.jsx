import { useState } from 'react';
import { X, Plus, Upload, Trash2 } from '../Icons'; // Assuming Trash2 exists or we use 'X'
import { loadMusicThemes, saveMusicTheme } from '../../utils/customWordLists';

const ContributeThemeModal = ({ isOpen, onClose, onContribute }) => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'create'
  const [selectedThemes, setSelectedThemes] = useState([]);

  // Create form state
  const [themeName, setThemeName] = useState('');
  const [songs, setSongs] = useState([]);
  const [fillers, setFillers] = useState([]);

  // Temp inputs for adding
  const [newSongLabel, setNewSongLabel] = useState('');
  const [newSongUrl, setNewSongUrl] = useState('');
  const [newFillerLabel, setNewFillerLabel] = useState('');
  const [newFillerDiff, setNewFillerDiff] = useState(5);

  const customLists = loadMusicThemes();
  const customThemeNames = Object.keys(customLists);

  if (!isOpen) return null;

  // --- List Tab Logic ---
  const toggleThemeSelection = (name) => {
    setSelectedThemes(prev =>
      prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]
    );
  };

  const handleContributeSelected = () => {
    if (selectedThemes.length > 0) {
      const themesToContribute = selectedThemes.map(name => ({
        name,
        ...customLists[name]
      }));
      onContribute(themesToContribute);
      setSelectedThemes([]);
      onClose();
    }
  };

  // --- Create Tab Logic ---
  const extractSpotifyId = (url) => {
    const match = url.match(/\/track\/([A-Za-z0-9]+)/);
    return match ? match[1] : null;
  };

  const previewId = extractSpotifyId(newSongUrl);

  const handleAddSong = () => {
    if (!newSongLabel.trim() || !previewId) return;
    setSongs([...songs, { label: newSongLabel.trim(), spotifyId: previewId, difficulty: 5 }]);
    setNewSongLabel('');
    setNewSongUrl('');
  };

  const handleAddFiller = () => {
    if (!newFillerLabel.trim()) return;
    setFillers([...fillers, { label: newFillerLabel.trim(), difficulty: Number(newFillerDiff) }]);
    setNewFillerLabel('');
    setNewFillerDiff(5);
  };

  const handleRemoveSong = (index) => setSongs(songs.filter((_, i) => i !== index));
  const handleRemoveFiller = (index) => setFillers(fillers.filter((_, i) => i !== index));

  const handleSaveAndContribute = () => {
    if (!themeName.trim() || (songs.length === 0 && fillers.length === 0)) return;

    const themeData = { songs, fillers };
    saveMusicTheme(themeName.trim(), themeData);
    onContribute([{ name: themeName.trim(), ...themeData }]);

    // Reset state
    setThemeName('');
    setSongs([]);
    setFillers([]);
    setActiveTab('list');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-surface border-2 border-brand-cyan rounded-3xl shadow-neon-cyan max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-cyan/20 bg-brand-cyan/5">
          <h2 className="text-2xl font-black text-brand-white uppercase tracking-wider drop-shadow-md">
            Playlist Personalizada
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-brand-light/50 hover:text-brand-pink hover:bg-brand-pink/10 rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-brand-cyan/20">
          <button
            className={`flex-1 py-4 font-bold tracking-widest uppercase text-xs transition-all ${activeTab === 'list' ? 'text-brand-cyan border-b-2 border-brand-cyan bg-brand-cyan/5' : 'text-brand-light/40 hover:text-brand-light'}`}
            onClick={() => setActiveTab('list')}
          >
            Mis Playlists
          </button>
          <button
            className={`flex-1 py-4 font-bold tracking-widest uppercase text-xs transition-all ${activeTab === 'create' ? 'text-brand-cyan border-b-2 border-brand-cyan bg-brand-cyan/5' : 'text-brand-light/40 hover:text-brand-light'}`}
            onClick={() => setActiveTab('create')}
          >
            Crear Nueva
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

          {activeTab === 'list' && (
            <div className="flex flex-col gap-4">
              {customThemeNames.length > 0 ? (
                <>
                  <p className="text-xs text-brand-light/60 font-bold uppercase tracking-wider mb-2">
                    Selecciona para aportar a la sala:
                  </p>
                  <div className="grid gap-3">
                    {customThemeNames.map(name => (
                      <button
                        key={name}
                        onClick={() => toggleThemeSelection(name)}
                        className={`w-full p-4 rounded-xl transition-all border text-left flex items-center justify-between ${selectedThemes.includes(name)
                          ? 'bg-brand-cyan/20 border-brand-cyan shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                          : 'bg-white/5 border-brand-light/10 hover:border-brand-light/30'
                          }`}
                      >
                        <span className="font-bold text-brand-white">{name}</span>
                        <div className="flex gap-3 text-xs opacity-60 font-bold">
                          <span>🎵 {customLists[name].songs?.length || 0}</span>
                          <span>🔲 {customLists[name].fillers?.length || 0}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 opacity-50">
                  <span className="text-4xl mb-4 block">💽</span>
                  <p className="font-bold tracking-widest uppercase text-xs">No tienes playlists guardadas</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <div className="flex flex-col gap-6">
              <div>
                <label className="text-xs text-brand-light/50 uppercase tracking-widest font-bold mb-2 block">Nombre de la Playlist</label>
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  placeholder="Ej: Pop de los 80s"
                  className="w-full bg-black/40 border border-brand-light/20 rounded-xl px-4 py-3 text-brand-white focus:outline-none focus:border-brand-cyan focus:shadow-neon-cyan transition-all"
                />
              </div>

              {/* Tracks Section */}
              <div className="bg-brand-purple/10 border border-brand-purple/30 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-brand-purple uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span>🎵</span> Canciones
                </h3>
                <p className="text-xs text-brand-light/60 mb-4">
                  Estas canciones sonarán durante la partida y aparecerán en los cartones.
                </p>

                <div className="flex flex-col gap-3 mb-4">
                  <input
                    type="text"
                    value={newSongLabel}
                    onChange={(e) => setNewSongLabel(e.target.value)}
                    placeholder="Nombre para el cartón (Ej: Michael Jackson - Thriller)"
                    className="w-full bg-black/40 border border-brand-light/20 rounded-xl px-4 py-2 text-sm text-brand-white focus:outline-none focus:border-brand-purple"
                  />
                  <input
                    type="text"
                    value={newSongUrl}
                    onChange={(e) => setNewSongUrl(e.target.value)}
                    placeholder="URL de Spotify (Ej: https://open.spotify.com/track/...)"
                    className="w-full bg-black/40 border border-brand-light/20 rounded-xl px-4 py-2 text-sm text-brand-white focus:outline-none focus:border-brand-purple"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] uppercase font-bold text-brand-light/40">
                      ID: {previewId || 'Inválido'}
                    </span>
                    <button
                      onClick={handleAddSong}
                      disabled={!newSongLabel.trim() || !previewId}
                      className="px-4 py-2 bg-brand-purple/20 text-brand-purple font-bold rounded-lg text-xs uppercase tracking-wider hover:bg-brand-purple hover:text-white transition-colors disabled:opacity-50"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>

                {songs.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                    {songs.map((song, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-brand-light/10">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-brand-light">{song.label}</span>
                          <span className="text-[10px] text-brand-light/50">{song.spotifyId}</span>
                        </div>
                        <button onClick={() => handleRemoveSong(idx)} className="text-red-400 p-2 hover:bg-red-400/20 rounded-lg">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fillers Section */}
              <div className="bg-brand-cyan/10 border border-brand-cyan/30 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-brand-cyan uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span>🔲</span> Rellenos (Engaños)
                </h3>
                <p className="text-xs text-brand-light/60 mb-4">
                  Opciones que aparecerán en los cartones pero NUNCA sonarán. Sirven para despistar.
                </p>

                <div className="flex flex-col gap-3 mb-4">
                  <input
                    type="text"
                    value={newFillerLabel}
                    onChange={(e) => setNewFillerLabel(e.target.value)}
                    placeholder="Nombre del relleno (Ej: Madonna - Like a Virgin)"
                    className="w-full bg-black/40 border border-brand-light/20 rounded-xl px-4 py-2 text-sm text-brand-white focus:outline-none focus:border-brand-cyan"
                  />
                  <div className="flex items-center gap-4">
                    <label className="text-xs text-brand-light/60 font-bold uppercase w-20">Dificultad:</label>
                    <input
                      type="range"
                      min="1" max="10"
                      value={newFillerDiff}
                      onChange={(e) => setNewFillerDiff(e.target.value)}
                      className="flex-1 accent-brand-cyan"
                    />
                    <span className="text-xs font-bold text-brand-cyan w-6 text-right">{newFillerDiff}</span>
                  </div>
                  <div className="flex justify-end mt-1">
                    <button
                      onClick={handleAddFiller}
                      disabled={!newFillerLabel.trim()}
                      className="px-4 py-2 bg-brand-cyan/20 text-brand-cyan font-bold rounded-lg text-xs uppercase tracking-wider hover:bg-brand-cyan hover:text-black transition-colors disabled:opacity-50"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>

                {fillers.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                    {fillers.map((filler, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-brand-light/10">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-brand-light">{filler.label}</span>
                          <span className="text-[10px] text-brand-cyan/70 font-bold">Dificultad: {filler.difficulty}</span>
                        </div>
                        <button onClick={() => handleRemoveFiller(idx)} className="text-red-400 p-2 hover:bg-red-400/20 rounded-lg">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-brand-cyan/20 bg-brand-surface mt-auto">
          {activeTab === 'list' && (
            <button
              onClick={handleContributeSelected}
              disabled={selectedThemes.length === 0}
              className={`w-full py-4 rounded-xl font-black tracking-widest uppercase text-sm transition-all shadow-neon-cyan ${selectedThemes.length > 0
                ? 'bg-gradient-to-r from-brand-cyan to-brand-pink text-white hover:opacity-90 active:scale-95'
                : 'bg-white/5 text-white/30 border border-white/10'
                }`}
            >
              Compartir Seleccionados
            </button>
          )}

          {activeTab === 'create' && (
            <button
              onClick={handleSaveAndContribute}
              disabled={!themeName.trim() || (songs.length === 0 && fillers.length === 0)}
              className={`w-full py-4 rounded-xl font-black tracking-widest uppercase text-sm transition-all shadow-neon-purple ${themeName.trim() && (songs.length > 0 || fillers.length > 0)
                ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white hover:opacity-90 active:scale-95'
                : 'bg-white/5 text-white/30 border border-white/10'
                }`}
            >
              Guardar y Contribuir
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ContributeThemeModal;
