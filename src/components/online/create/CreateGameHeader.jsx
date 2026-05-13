import { ArrowLeft } from '../../Icons';

const CreateGameHeader = ({ onBack, toggleSlot }) => (
  <div className="relative mb-6 flex items-center justify-between">
    <button
      onClick={onBack}
      className="p-2 rounded-xl hover:bg-brand-wood/10 text-brand-wood transition-all active:scale-95"
      title="Volver"
    >
      <ArrowLeft size={28} />
    </button>
    <h1 className="text-2xl font-bold text-brand-wood tracking-wider drop-shadow-sm">NUEVA PARTIDA</h1>
    {toggleSlot || <div className="w-10"></div>} {/* Spacer if no toggle */}
  </div>
);

export default CreateGameHeader;
