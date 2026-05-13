import CreateGameHeader from './create/CreateGameHeader';
import CreateGameForm from './create/CreateGameForm';
import SlidingToggle from '../shared/SlidingToggle';
import PrimaryButton from '../shared/PrimaryButton';

const OnlineCreateScreen = ({ setScreen, newGameSettings, setNewGameSettings,
  onlineGames, setOnlineGames, playerNames, createOnlineGame,
  playerName, setPlayerName, getRandomName }) => {
  const handleSubmit = () => {
    let finalName = playerName.trim();
    if (!finalName) {
      finalName = getRandomName();
      setPlayerName(finalName);
    }

    if (createOnlineGame) {
      createOnlineGame(finalName);
    } else {
      // Local fallback for testing/demo without socket
      const newGame = {
        id: Date.now(),
        name: newGameSettings.name || `Partida de ${playerNames[0] || 'Jugador'}`,
        players: 1,
        maxPlayers: newGameSettings.players,
        type: newGameSettings.type,
        status: 'waiting'
      };
      setOnlineGames([...onlineGames, newGame]);
      setScreen('online_lobby');
    }
  };

  return (
    <div className="p-6 relative z-10 h-full flex flex-col">
      <CreateGameHeader
        onBack={() => setScreen('online_lobby')}
        toggleSlot={
          <div className="mr-12 z-10 shrink-0">
            <SlidingToggle
              value={newGameSettings.isPrivate || false}
              onChange={(val) => setNewGameSettings({ ...newGameSettings, isPrivate: val })}
              leftLabel="Pública"
              rightLabel="Privada"
              leftValue={false}
              rightValue={true}
            />
          </div>
        }
      />

      <CreateGameForm
        playerName={playerName}
        setPlayerName={setPlayerName}
        newGameSettings={newGameSettings}
        setNewGameSettings={setNewGameSettings}
        onSubmit={handleSubmit}
        getRandomName={getRandomName}
      />

      <PrimaryButton
        onClick={handleSubmit}
        className="mt-4"
      >
        CREAR AHORA
      </PrimaryButton>
    </div>
  );
};

export default OnlineCreateScreen;

