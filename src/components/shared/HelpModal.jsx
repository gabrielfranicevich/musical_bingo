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
            <p className="font-medium">
              MONO es un juego de engaño y deducción. Así se juega:
            </p>
            <ul className="text-sm space-y-3 font-medium bg-brand-wood/5 p-4 rounded-xl">
              <li className="flex gap-2">
                <span>🗣️</span>
                <span>Dar pistas de las palabras por turnos</span>
              </li>
              <li className="flex gap-2">
                <span>🕵️‍♂️</span>
                <span>Los monos tienen que intentar pasar desapercibidos</span>
              </li>
              <li className="flex gap-2">
                <span>🗳️</span>
                <span>Votar para descubrir a los monos</span>
              </li>
            </ul>
            <div className="space-y-2 text-sm font-medium mt-4">
              <p>
                <span className="font-bold text-brand-salmon">• OFFLINE:</span> Se juega con un solo dispositivo que se van pasando.
              </p>
              <p>
                <span className="font-bold text-brand-salmon">• ONLINE:</span> Cada jugador usa su propio dispositivo uniéndose a una sala.
              </p>
            </div>
          </div>
        );
      case 'setup':
      case 'online_create':
        return (
          <div className="space-y-4">
            <p className="font-medium">Configurá tu partida paso a paso:</p>
            <ol className="text-sm space-y-3 font-medium bg-brand-wood/5 p-4 rounded-xl list-decimal list-inside">
              <li>Elegí una o más categorías de palabras (o creá la tuya).</li>
              <li>Añadí el nombre de todos los jugadores.</li>
              <li>Decidí cuántos <strong>Monos</strong> habrá en la ronda.</li>
            </ol>
            {screen === 'online_create' && (
              <p className="text-sm font-medium">Una vez creada, vas a poder compartir el código a tus amigos para que se unan.</p>
            )}
          </div>
        );
      case 'reveal':
        return (
          <div className="space-y-4 text-center">
            <p className="font-medium">Averiguá tu rol en secreto:</p>
            <div className="bg-brand-wood/5 p-4 rounded-xl text-sm space-y-3 text-left">
              <p>• Si ves una <strong>palabra</strong> escrita, ¡memorizala y mantenela en secreto!</p>
              <p>• Si ves <strong>un dibujo de un mono</strong> y dice "SOS EL MONO", tu rol es el mono. ¡Actuá normal e intentá deducir la palabra!</p>
            </div>
          </div>
        );
      case 'playing':
      case 'online_playing':
        return (
          <div className="space-y-4">
            <p className="font-bold uppercase tracking-wide text-brand-wood/70 text-sm">Reglas Rápidas</p>
            <ul className="text-sm space-y-4 font-medium bg-brand-wood/5 p-4 rounded-xl">
              <li className="flex gap-3 items-start">
                <span className="text-xl">🗣️</span>
                <span><strong>Den pistas</strong> relacionadas a la palabra secreta, por turnos. Tratá de no ser obvio, ¡el mono está escuchando!</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-xl">🕵️‍♂️</span>
                <span><strong>El Mono</strong> {numMonos > 1 ? '(o los monos) deben' : 'debe'} intentar pasar desapercibido y descubrir la palabra secreta.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-xl">🗳️</span>
                <span><strong>A votar:</strong> Al final, discutan y voten para decidir quién{numMonos > 1 ? 'es' : ''} creen que {numMonos > 1 ? 'son los monos' : 'es el mono'}.</span>
              </li>
            </ul>
          </div>
        );
      case 'online_lobby':
        return (
          <div className="space-y-4">
            <p className="font-medium gap-2 flex items-center">
              <span className="bg-brand-pastel-mint p-1 rounded-md">🌐</span> Lobby Online
            </p>
            <div className="bg-brand-wood/5 p-4 rounded-xl text-sm space-y-3 font-medium">
              <p>Podés crear una nueva sala o unirte a una existente.</p>
              <p>Para unirte, ingresá el <strong>código de 4 letras</strong>, copiá el <strong>link</strong> de la partida o elegí de la <strong>lista de partidas</strong>.</p>
            </div>
          </div>
        );
      case 'online_waiting':
        return (
          <div className="space-y-4">
            <p className="font-medium gap-2 flex items-center">
              <span className="bg-brand-pastel-mint p-1 rounded-md">⏳</span> Sala de Espera
            </p>
            {isHost ? (
              <div className="bg-brand-wood/5 p-4 rounded-xl text-sm space-y-3 font-medium">
                <p>¡Sos el <strong>anfitrión</strong>! Compartí el código de la sala con tus amigos para que se unan.</p>
                <p>Ajustá las opciones y cuando estén listos, ¡iniciá la partida!</p>
              </div>
            ) : (
              <div className="bg-brand-wood/5 p-4 rounded-xl text-sm space-y-3 font-medium">
                <p>Te has unido a la sala correctamente y ahora estás en espera.</p>
                <p>Aprovechá para proponer temas, y cuando estén todos listos, <strong>el anfitrión</strong> iniciará la partida.</p>
              </div>
            )}
          </div>
        );
      default:
        return (
          <p className="text-sm font-medium bg-brand-wood/5 p-4 rounded-xl">¡Explorá, jugá, y lo más importante: GANÁ!</p>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 h-[100dvh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-[90vw] sm:max-w-sm bg-brand-cream rounded-3xl p-6 shadow-2xl border-4 border-brand-wood animate-scale-up z-10 flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-brand-wood/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-brand-pastel-blue text-brand-wood p-1.5 rounded-lg">
              <Info size={20} />
            </div>
            <h2 className="text-xl font-bold text-brand-wood">Ayuda</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brand-wood/10 rounded-xl transition-colors text-brand-wood disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="text-brand-wood overflow-y-auto pr-2 custom-scrollbar">
          {getHelpContent()}
        </div>

        <div className="mt-6 shrink-0">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center p-3 sm:p-4 rounded-xl font-bold text-lg transition-all border-2 border-brand-wood bg-brand-peach hover:bg-brand-peach/90 shadow-[4px_4px_0px_0px_rgba(93,64,55,1)] active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] text-brand-wood"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(HelpModal);
