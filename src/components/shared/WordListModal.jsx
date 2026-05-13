import { useState, useEffect } from 'react';
import InputField from './InputField';
import { parseWordListInput, formatWordListForInput } from '../../utils/textUtils';

const WordListModal = ({ isOpen, onClose, onSave, existingList = null }) => {
  const [listName, setListName] = useState(existingList?.name || '');
  const [wordsInput, setWordsInput] = useState(
    existingList?.words ? formatWordListForInput(existingList.words) : ''
  );
  const [singleWord, setSingleWord] = useState('');
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (existingList) {
        setListName(existingList.name);
        setWordsInput(formatWordListForInput(existingList.words));
      } else {
        setListName('');
        setWordsInput('');
      }
      setSingleWord('');
      setErrors([]);
    }
  }, [isOpen, existingList]);

  if (!isOpen) return null;

  const parseWords = (input) => {
    return parseWordListInput(input);
  };

  const handleSave = () => {
    const newErrors = [];

    if (!listName.trim()) {
      newErrors.push('El nombre de la lista es requerido');
    }

    const words = parseWords(wordsInput);
    if (words.length === 0) {
      newErrors.push('Debe agregar al menos una palabra');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(listName.trim(), words);
    handleClose();
  };

  const handleAddWord = () => {
    if (singleWord.trim()) {
      setWordsInput((prev) => (prev ? `${prev}, ${singleWord.trim()}` : singleWord.trim()));
      setSingleWord('');
    }
  };

  const handleClose = () => {
    setListName('');
    setWordsInput('');
    setSingleWord('');
    setErrors([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-cream rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border-4 border-brand-wood shadow-[8px_8px_0px_0px_rgba(93,64,55,0.3)]">
        <h2 className="text-2xl font-bold text-brand-wood mb-4">
          {existingList ? 'Editar Lista' : 'Nueva Lista de Palabras'}
        </h2>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-100 border-2 border-red-400 rounded-xl">
            {errors.map((err, i) => (
              <div key={i} className="text-red-700 text-sm font-bold">{err}</div>
            ))}
          </div>
        )}

        {/* List Name */}
        <InputField
          label="Nombre de la Lista"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder="Ej: Animales, Países, etc."
          containerClassName="mb-4"
        />

        {/* Words Input */}
        <div className="mb-4">
          <label className="text-sm font-bold text-brand-wood uppercase tracking-wider ml-1 block mb-2">
            Lista de Palabras
          </label>
          <textarea
            value={wordsInput}
            onChange={(e) => setWordsInput(e.target.value)}
            placeholder="perro, gato, león, ..."
            rows={4}
            className="w-full p-3 border-2 border-brand-wood/20 rounded-xl focus:border-brand-bronze focus:outline-none bg-white text-brand-wood placeholder-brand-wood/40 font-bold resize-none"
          />
          <div className="text-xs text-brand-wood/60 mt-1 ml-1">
            Formato: palabra1, palabra2, palabra3
          </div>
        </div>

        {/* Add Single Word */}
        <div className="mb-4">
          <label className="text-sm font-bold text-brand-wood uppercase tracking-wider ml-1 block mb-2">
            Agregar Palabra Individual
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <InputField
                value={singleWord}
                onChange={(e) => setSingleWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
                placeholder="Escribe una palabra"
                containerClassName="space-y-0"
              />
            </div>
            <button
              onClick={handleAddWord}
              className="px-4 py-3 bg-brand-pastel-mint border-2 border-brand-wood text-brand-wood font-bold rounded-xl hover:brightness-95 transition-all shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none"
            >
              +
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 bg-white border-2 border-brand-wood text-brand-wood font-bold rounded-xl hover:bg-brand-beige/20 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-brand-bronze text-white font-bold rounded-xl hover:brightness-95 transition-all shadow-[4px_4px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] border-2 border-brand-wood"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordListModal;
