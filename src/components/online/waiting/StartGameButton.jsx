import { Play } from '../../Icons';
import PrimaryButton from '../../shared/PrimaryButton';

const StartGameButton = ({ isHost, onStart, playerCount }) => {
  if (isHost) {
    return (
      <PrimaryButton
        onClick={onStart}
        disabled={playerCount < 1}
      >
        <Play size={24} />
        EMPEZAR PARTIDA
      </PrimaryButton>
    );
  }

  return (
    <div className="text-center text-neon-cyan font-bold animate-pulse py-5 tracking-widest uppercase">
      Esperando al DJ...
    </div>
  );
};

export default StartGameButton;
