import { useCallback } from 'react';
import { useLocalStorage } from '../useLocalStorage';
import { SUSTANTIVOS, ADJETIVOS } from '../../data/constants';
import { calculateMaxMonos } from '../../utils/gameLogic';

export const useOfflineSetup = () => {
  // State
  const [selectedThemes, setSelectedThemes] = useLocalStorage('mono_setup_themes', ['básico']);
  const [numPlayers, setNumPlayers] = useLocalStorage('mono_setup_players', 3);
  const [numMonos, setNumMonos] = useLocalStorage('mono_setup_monos', 1);
  const [playerNames, setPlayerNames] = useLocalStorage('mono_setup_names', ['', '', '']);
  const [showMonoHints, setShowMonoHints] = useLocalStorage('mono_setup_hints', true);

  // Derived State
  const maxMonos = calculateMaxMonos(numPlayers);

  // Actions
  const toggleTheme = useCallback((theme) => {
    setSelectedThemes(prev => {
      if (prev.includes(theme)) {
        if (prev.length > 1) {
          return prev.filter(t => t !== theme);
        }
        return prev;
      } else {
        return [...prev, theme];
      }
    });
  }, [setSelectedThemes]);

  const updatePlayerName = useCallback((index, name) => {
    setPlayerNames(prev => {
      const newNames = [...prev];
      newNames[index] = name;
      return newNames;
    });
  }, [setPlayerNames]);

  const getRandomName = useCallback(() => {
    const sustantivo = SUSTANTIVOS[Math.floor(Math.random() * SUSTANTIVOS.length)];
    const adjetivo = ADJETIVOS[Math.floor(Math.random() * ADJETIVOS.length)];
    return `${sustantivo} ${adjetivo}`;
  }, []);

  const generateRandomName = useCallback((index) => {
    const name = getRandomName();
    updatePlayerName(index, name);
  }, [updatePlayerName, getRandomName]);

  const addPlayer = useCallback(() => {
    const newNumPlayers = numPlayers + 1;
    setNumPlayers(newNumPlayers);
    setPlayerNames(prev => [...prev, '']);

    const newMaxMonos = calculateMaxMonos(newNumPlayers);
    if (numMonos > newMaxMonos) {
      setNumMonos(newMaxMonos);
    }
  }, [numPlayers, numMonos, setNumPlayers, setPlayerNames, setNumMonos]);

  const removePlayer = useCallback(() => {
    if (numPlayers > 3) {
      const newNumPlayers = numPlayers - 1;
      setNumPlayers(newNumPlayers);
      setPlayerNames(prev => prev.slice(0, -1));

      const newMaxMonos = calculateMaxMonos(newNumPlayers);
      if (numMonos > newMaxMonos) {
        setNumMonos(newMaxMonos);
      }
    }
  }, [numPlayers, numMonos, setNumPlayers, setPlayerNames, setNumMonos]);

  const removePlayerAt = useCallback((index) => {
    if (numPlayers > 3) {
      const newNumPlayers = numPlayers - 1;
      setNumPlayers(newNumPlayers);
      setPlayerNames(prev => prev.filter((_, i) => i !== index));

      const newMaxMonos = calculateMaxMonos(newNumPlayers);
      if (numMonos > newMaxMonos) {
        setNumMonos(newMaxMonos);
      }
    }
  }, [numPlayers, numMonos, setNumPlayers, setPlayerNames, setNumMonos]);

  const reorderPlayer = useCallback((fromIndex, toIndex) => {
    setPlayerNames(prev => {
      const newNames = [...prev];
      const [movedItem] = newNames.splice(fromIndex, 1);
      newNames.splice(toIndex, 0, movedItem);
      return newNames;
    });
  }, [setPlayerNames]);

  const addMono = useCallback(() => {
    // Only use local maxMonos which is derived from CURRENT numPlayers
    // We re-calculate inside here or rely on the prop? 
    // It's safer to recalculate or use the derived value if it's in scope.
    // Since maxMonos is in scope and reactive to numPlayers, we can use it.
    if (numMonos < maxMonos) {
      setNumMonos(numMonos + 1);
    }
  }, [numMonos, maxMonos, setNumMonos]);

  const removeMono = useCallback(() => {
    if (numMonos > 1) {
      setNumMonos(numMonos - 1);
    }
  }, [numMonos, setNumMonos]);

  return {
    selectedThemes,
    numPlayers,
    numMonos,
    maxMonos,
    playerNames,
    showMonoHints,
    setShowMonoHints,
    toggleTheme,
    updatePlayerName,
    generateRandomName,
    addPlayer,
    removePlayer,
    removePlayerAt,
    reorderPlayer,
    addMono,
    removeMono,
    getRandomName
  };
};
