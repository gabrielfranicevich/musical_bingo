import { ArrowLeft } from '../../Icons';

const PhaseHeader = ({ gamePhase, onLeave }) => {
  const getPhaseTitle = (phase) => {
    switch (phase) {
      case 'playing': return 'JUGANDO';
      case 'voting': return 'VOTACIÓN';
      case 'mono_guessing': return 'ADIVINANZA';
      case 'results': return 'RESULTADOS';
      default: return 'JUGANDO';
    }
  };

  return (
    <div className="relative mb-4 flex items-center justify-center">
      <button
        onClick={onLeave}
        className="absolute left-0 p-2 rounded-xl hover:bg-brand-wood/10 text-brand-wood transition-all active:scale-95"
        title="Salir"
      >
        <ArrowLeft size={28} />
      </button>
      <h1 className="text-2xl font-bold text-brand-wood tracking-wider">
        {getPhaseTitle(gamePhase)}
      </h1>
    </div>
  );
};

export default PhaseHeader;
