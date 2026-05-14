import React, { memo, useEffect } from 'react';
import { X, Info } from '../Icons';

const HelpModal = ({ isOpen, onClose, screen, isHost }) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getHelpContent = () => {
    switch (screen) {
      case 'home':
        return (
          <div className="space-y-4">
            <p className="font-bold text-brand-cyan uppercase tracking-wide text-sm">¿Qué es el Bingo Musical?</p>
            <ul className="text-sm space-y-3 font-medium bg-white/5 p-4 rounded-xl border border-brand-light/10">
              <li className="flex gap-2">
                <span>🎵</span>
                <span>El <strong>DJ (host)</strong> pone música. Cada canción suena completa, o el host puede avanzar manualmente.</span>
              </li>
              <li className="flex gap-2">
                <span>☑️</span>
                <span>Los jugadores tienen un <strong>cartón</strong> con nombres de canciones. Si suena una que tenés, ¡marcá esa casilla!</span>
              </li>
              <li className="flex gap-2">
                <span>📣</span>
                <span>El primero en completar un patrón (fila, columna, diagonal…) canta <strong>¡BINGO!</strong></span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>El host revisa el bingo. Si es válido, ¡ganó!</span>
              </li>
            </ul>
            <p className="text-sm font-medium">
              <span className="font-bold text-brand-cyan">ONLINE:</span> Cada jugador usa su propio dispositivo. El DJ controla la música desde su pantalla.
            </p>
          </div>
        );
      case 'online_create':
        return (
          <div className="space-y-4">
            <p className="font-medium">Creá tu sala de Bingo Musical:</p>
            <ol className="text-sm space-y-3 font-medium bg-white/5 p-4 rounded-xl border border-brand-light/10 list-decimal list-inside">
              <li>Elegí un nombre para la sala.</li>
              <li>Seleccioná el modo: <strong>En persona</strong> (el DJ pone el audio en un parlante) o <strong>Remoto</strong> (cada jugador escucha el Spotify en su dispositivo).</li>
              <li>Compartí el código de 4 letras con tus amigos para que se unan.</li>
            </ol>
          </div>
        );
      case 'online_waiting':
        return (
          <div className="space-y-4">
            <p className="font-medium gap-2 flex items-center">
              <span>⏳</span> Sala de Espera
            </p>
            {isHost ? (
              <div className="bg-white/5 p-4 rounded-xl text-sm space-y-3 font-medium border border-brand-light/10">
                <p>¡Sos el <strong>DJ (host)</strong>! Compartí el código con tus amigos.</p>
                <p>Podés aportar <strong>playlists musicales</strong> personalizadas antes de empezar.</p>
                <p>Cuando estén todos listos, ¡dale play!</p>
              </div>
            ) : (
              <div className="bg-white/5 p-4 rounded-xl text-sm space-y-3 font-medium border border-brand-light/10">
                <p>Te uniste a la sala. Esperá a que el host inicie la partida.</p>
                <p>Aprovechá para proponer playlists con el botón <strong>＋ Aportar tema</strong>.</p>
              </div>
            )}
          </div>
        );
      case 'playing':
      case 'online_playing':
        return isHost ? (
          <div className="space-y-4">
            <p className="font-bold uppercase tracking-wide text-brand-pink text-sm">Controles del DJ</p>
            <ul className="text-sm space-y-3 font-medium bg-white/5 p-4 rounded-xl border border-brand-light/10">
              <li className="flex gap-2">
                <span>▶️</span>
                <span>Pulsá <strong>Dale Play</strong> para empezar la primera canción.</span>
              </li>
              <li className="flex gap-2">
                <span>⏭</span>
                <span>Las canciones avanzan <strong>automáticamente</strong> al terminar. Podés adelantar con <strong>Siguiente Track</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>Si alguien canta BINGO, se abrirá la pantalla de revisión. Vos decidís si es válido o no.</span>
              </li>
            </ul>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-bold uppercase tracking-wide text-brand-cyan text-sm">Reglas Rápidas</p>
            <ul className="text-sm space-y-3 font-medium bg-white/5 p-4 rounded-xl border border-brand-light/10">
              <li className="flex gap-2">
                <span>👂</span>
                <span>Escuchá la música que pone el DJ.</span>
              </li>
              <li className="flex gap-2">
                <span>☑️</span>
                <span>Si la canción que suena está en tu cartón, <strong>marcá esa casilla</strong>. Solo podés marcar <strong>una casilla por canción</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span>📣</span>
                <span>Completá un patrón (fila, columna, diagonal…) y ¡cantá BINGO! El host revisará tu cartón.</span>
              </li>
            </ul>
          </div>
        );
      case 'online_lobby':
        return (
          <div className="space-y-4">
            <p className="font-medium gap-2 flex items-center">
              <span>🌐</span> Lobby Online
            </p>
            <div className="bg-white/5 p-4 rounded-xl text-sm space-y-3 font-medium border border-brand-light/10">
              <p>Podés crear una nueva sala o unirte a una existente.</p>
              <p>Para unirte, ingresá el <strong>código de 4 letras</strong>, copiá el <strong>link</strong> de la partida o elegí de la <strong>lista de partidas</strong>.</p>
            </div>
          </div>
        );
      default:
        return (
          <p className="text-sm font-medium bg-white/5 p-4 rounded-xl border border-brand-light/10">
            🎵 ¡Escuchá, marcá, y cantá BINGO!
          </p>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 h-[100dvh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-[90vw] sm:max-w-sm bg-brand-surface border-2 border-brand-cyan rounded-3xl p-6 shadow-neon-cyan animate-scale-up z-10 flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-brand-cyan/20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-brand-cyan/20 text-brand-cyan p-1.5 rounded-lg">
              <Info size={20} />
            </div>
            <h2 className="text-xl font-bold text-brand-white">Ayuda</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brand-pink/10 hover:text-brand-pink rounded-xl transition-colors text-brand-light/50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="text-brand-light overflow-y-auto pr-2 scrollbar-hide">
          {getHelpContent()}
        </div>

        <div className="mt-6 shrink-0">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center p-3 sm:p-4 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-brand-cyan to-brand-pink text-brand-dark hover:opacity-90 active:scale-95 shadow-neon-cyan uppercase tracking-widest"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(HelpModal);
