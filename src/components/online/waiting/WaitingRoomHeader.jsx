import { useState } from 'react';
import { ArrowLeft, Check, Copy } from '../../Icons';

const WaitingRoomHeader = ({ roomName, roomId, onLeave }) => {
  const [copied, setCopied] = useState(false);

  const copyGameCode = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(roomId);
        setCopied(true);
      } else {
        // Fallback for non-secure contexts (http on LAN)
        const textArea = document.createElement("textarea");
        textArea.value = roomId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <div className="relative mb-6 flex items-center justify-center">
        <button
          onClick={onLeave}
          className="absolute left-0 p-2 rounded-xl hover:bg-white/10 text-brand-light transition-all active:scale-95"
          title="Salir"
        >
          <ArrowLeft size={28} />
        </button>
        <div className="text-center flex flex-col items-center">
          <div className="flex items-end gap-1 mb-1 animate-sound-wave">
            <div className="w-1.5 h-3 bg-brand-cyan rounded-full"></div>
            <div className="w-1.5 h-6 bg-brand-pink rounded-full"></div>
            <div className="w-1.5 h-4 bg-brand-purple rounded-full"></div>
            <div className="w-1.5 h-5 bg-brand-cyan rounded-full"></div>
            <div className="w-1.5 h-2 bg-brand-pink rounded-full"></div>
          </div>
          <h1 className="text-xs font-bold text-neon-pink uppercase tracking-widest drop-shadow-md">SALA</h1>
          <h2 className="text-4xl font-black text-brand-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] uppercase">{roomName}</h2>
        </div>
      </div>

      <div className="bg-glass shadow-neon-cyan p-4 rounded-2xl border border-brand-cyan/30 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-brand-light/70 uppercase tracking-wider">Código de Juego</span>
            <div className="text-3xl font-black text-neon-cyan tracking-[0.3em] mt-1">{roomId}</div>
          </div>
          <button
            onClick={copyGameCode}
            className={`p-3 rounded-xl border transition-all ${copied
              ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-neon-cyan'
              : 'bg-black/30 border-brand-light/20 text-brand-light hover:border-brand-cyan/50 hover:text-brand-cyan'
              }`}
            title={copied ? '¡Copiado!' : 'Copiar código'}
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default WaitingRoomHeader;
