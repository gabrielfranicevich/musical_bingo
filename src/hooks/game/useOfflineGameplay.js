import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../useLocalStorage';
import { THEMES } from '../../data/constants';
import { generateHints } from '../../utils/hintGenerator';

export const useOfflineGameplay = (setScreen, setupData, customLists) => {
  const { selectedThemes, numPlayers, numMonos, playerNames, showMonoHints } = setupData;

  const [currentPlayerIndex, setCurrentPlayerIndex] = useLocalStorage('mono_game_playerIndex', 0);
  const [gameData, setGameData] = useLocalStorage('mono_game_data', null);
  const [wordRevealed, setWordRevealed] = useState(false);

  // Restore screen state on mount if a game is active
  useEffect(() => {
    if (gameData) {
      if (currentPlayerIndex < gameData.players.length) {
        setScreen('reveal');
      } else {
        setScreen('playing');
      }
    }
  }, []); // Run once on mount

  const startGame = useCallback(async () => {
    const allWords = [...new Set(selectedThemes.flatMap(theme => {
      if (THEMES[theme]) return THEMES[theme];
      if (customLists[theme]) return customLists[theme];
      return [];
    }))];

    if (allWords.length === 0) {
      alert("No hay palabras en los temas seleccionados");
      return;
    }

    const selectedWord = allWords[Math.floor(Math.random() * allWords.length)];

    const finalPlayerNames = playerNames.slice(0, numPlayers).map((name, i) =>
      name.trim() ? name : `Jugador ${i + 1}`
    );

    const monoIndices = [];
    const availableIndices = Array.from({ length: numPlayers }, (_, i) => i);
    for (let i = 0; i < numMonos; i++) {
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      monoIndices.push(availableIndices[randomIndex]);
      availableIndices.splice(randomIndex, 1);
    }

    const playerOrder = Array.from({ length: numPlayers }, (_, i) => i);
    for (let i = playerOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerOrder[i], playerOrder[j]] = [playerOrder[j], playerOrder[i]];
    }

    let monoHints = [];
    if (showMonoHints) {
      if (numMonos > 0) {
        monoHints = await generateHints(selectedWord, numMonos);
      }
    }

    setGameData({
      word: selectedWord,
      monoIndices: monoIndices,
      monoHints: monoHints,
      players: finalPlayerNames,
      playerOrder: playerOrder,
      showMonoHints: showMonoHints
    });
    setCurrentPlayerIndex(0);
    setWordRevealed(false);
    setScreen('reveal');
  }, [selectedThemes, playerNames, numPlayers, numMonos, setScreen, customLists, setGameData, setCurrentPlayerIndex]);

  const showWord = useCallback(() => {
    setWordRevealed(true);
  }, []);

  const nextPlayer = useCallback(() => {
    if (currentPlayerIndex < numPlayers - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
      setWordRevealed(false);
    } else {
      setScreen('playing');
    }
  }, [currentPlayerIndex, numPlayers, setScreen, setCurrentPlayerIndex]);

  const resetGame = useCallback(() => {
    setScreen('setup');
    setCurrentPlayerIndex(0);
    setGameData(null);
    setWordRevealed(false);
  }, [setScreen, setCurrentPlayerIndex, setGameData]);

  const isMono = gameData && gameData.monoIndices.includes(currentPlayerIndex);

  return {
    currentPlayerIndex,
    gameData,
    wordRevealed,
    startGame,
    showWord,
    nextPlayer,
    resetGame,
    isMono
  };
};
