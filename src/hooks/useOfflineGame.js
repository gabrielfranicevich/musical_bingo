import { useState, useCallback } from 'react';
import { useOfflineSetup } from './game/useOfflineSetup';
import { useWordLists } from './game/useWordLists';
import { useOfflineGameplay } from './game/useOfflineGameplay';

export const useOfflineGame = (setScreen) => {
  // Setup Logic
  const setup = useOfflineSetup();

  // Custom Lists Logic
  const lists = useWordLists(setup.selectedThemes, setup.toggleTheme);

  // Gameplay Logic
  const gameplay = useOfflineGameplay(setScreen, setup, lists.customLists);

  // UI State (kept here as it's view-specific glue)
  const [themesExpanded, setThemesExpanded] = useState(false);
  const [playersExpanded, setPlayersExpanded] = useState(false);
  const [monosExpanded, setMonosExpanded] = useState(false);
  const [namesExpanded, setNamesExpanded] = useState(false);
  const [turnOrderExpanded, setTurnOrderExpanded] = useState(true);
  const [allPlayersExpanded, setAllPlayersExpanded] = useState(false);
  const [rulesExpanded, setRulesExpanded] = useState(false);

  const resetGame = useCallback(() => {
    gameplay.resetGame();
    // Reset UI toggles
    setMonosExpanded(false);
    setNamesExpanded(false);
    setThemesExpanded(false);
    setPlayersExpanded(false);
    setTurnOrderExpanded(true);
    setAllPlayersExpanded(false);
    setRulesExpanded(false);
  }, [gameplay]);

  return {
    ...setup,
    ...lists,
    ...gameplay,
    resetGame, // Override resetGame to include UI reset

    // UI State
    themesExpanded, setThemesExpanded,
    playersExpanded, setPlayersExpanded,
    monosExpanded, setMonosExpanded,
    namesExpanded, setNamesExpanded,
    turnOrderExpanded, setTurnOrderExpanded,
    allPlayersExpanded, setAllPlayersExpanded,
    rulesExpanded, setRulesExpanded,
  };
};
