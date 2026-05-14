import { useState } from 'react';

const GameCodeInput = ({ onJoin }) => {
  const [code, setCode] = useState('');

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    setCode(value);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    setCode(pastedText);
  };

  const handleJoin = () => {
    if (code.length === 4) onJoin(code);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && code.length === 4) handleJoin();
  };

  // if (there are no joinable games) return null;

  return (
    <div className="mb-4">
      <label className="text-sm font-bold text-brand-light uppercase tracking-wider ml-1">Código de Juego</label>
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={code}
          onChange={handleChange}
          onPaste={handlePaste}
          placeholder="XXXX"
          maxLength={4}
          className="flex-1 p-3 border-2 border-brand-light/10 rounded-xl focus:border-brand-cyan focus:outline-none bg-glass text-brand-light font-bold text-lg text-center tracking-widest uppercase"
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleJoin}
          disabled={code.length !== 4}
          className="px-6 py-3 bg-brand-bronze text-white rounded-xl font-bold shadow-[2px_2px_0px_0px_#5D4037] hover:translate-y-[-1px] active:translate-y-0.5 transition-all border-2 border-brand-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          UNIRSE
        </button>
      </div>
    </div>
  );
};

export default GameCodeInput;
