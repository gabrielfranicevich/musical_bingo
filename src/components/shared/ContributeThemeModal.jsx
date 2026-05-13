import { useState } from 'react';
import { X, Plus, Upload } from '../Icons';
import { loadWordLists } from '../../utils/customWordLists';
import WordListModal from './WordListModal';

const ContributeThemeModal = ({ isOpen, onClose, onContribute }) => {
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const customLists = loadWordLists();
  const customThemeNames = Object.keys(customLists);

  if (!isOpen) return null;

  const toggleThemeSelection = (themeName) => {
    setSelectedThemes(prev =>
      prev.includes(themeName)
        ? prev.filter(t => t !== themeName)
        : [...prev, themeName]
    );
  };

  const handleContribute = () => {
    if (selectedThemes.length > 0) {
      const themesToContribute = selectedThemes.map(name => ({
        name,
        words: customLists[name]
      }));
      onContribute(themesToContribute);
      setSelectedThemes([]);
      onClose();
    }
  };

  const handleCreateNew = (name, words) => {
    // Contribute the newly created theme immediately
    onContribute([{ name, words }]);
    setShowCreateModal(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(93,64,55,1)] border-4 border-brand-wood max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-brand-wood/20">
            <h2 className="text-2xl font-bold text-brand-wood">Contribuir Temas</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-brand-beige rounded-lg transition-all"
            >
              <X size={24} className="text-brand-wood" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {customThemeNames.length > 0 ? (
              <>
                <p className="text-sm text-brand-wood/70 mb-4 font-bold">
                  Selecciona uno o más temas de tu colección para compartir con la sala:
                </p>
                <div className="space-y-2 mb-6">
                  {customThemeNames.map(themeName => (
                    <button
                      key={themeName}
                      onClick={() => toggleThemeSelection(themeName)}
                      className={`w-full p-4 rounded-xl font-bold capitalize transition-all border-2 text-left ${selectedThemes.includes(themeName)
                          ? 'bg-brand-pastel-mint text-brand-wood border-brand-wood shadow-[2px_2px_0px_0px_rgba(93,64,55,1)]'
                          : 'bg-white text-brand-wood border-brand-wood/20 hover:border-brand-wood/50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{themeName}</span>
                        <span className="text-xs opacity-70">
                          {customLists[themeName].length} palabras
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-brand-wood/70 mb-4 font-bold text-center py-4">
                No tienes temas personalizados aún. ¡Crea uno nuevo!
              </p>
            )}

            <div className="border-t-2 border-brand-wood/20 pt-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full p-4 rounded-xl font-bold bg-brand-pastel-mint text-brand-wood border-2 border-brand-wood hover:brightness-95 transition-all shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Crear Nuevo Tema
              </button>
            </div>
          </div>

          {/* Footer */}
          {customThemeNames.length > 0 && (
            <div className="p-6 border-t-2 border-brand-wood/20 bg-brand-wood/5">
              <button
                onClick={handleContribute}
                disabled={selectedThemes.length === 0}
                className={`w-full p-4 rounded-xl font-bold transition-all border-2 flex items-center justify-center gap-2 ${selectedThemes.length > 0
                    ? 'bg-brand-bronze text-white border-brand-wood shadow-[4px_4px_0px_0px_rgba(93,64,55,1)] hover:brightness-110 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(93,64,55,1)]'
                    : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                  }`}
              >
                <Upload size={20} />
                Compartir {selectedThemes.length > 0 ? `(${selectedThemes.length})` : ''}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* WordListModal for creating new themes */}
      <WordListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateNew}
      />
    </>
  );
};

export default ContributeThemeModal;
