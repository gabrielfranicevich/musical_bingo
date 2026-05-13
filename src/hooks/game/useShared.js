import { useCallback } from 'react';
import { useLocalStorage } from '../useLocalStorage';
import { SUSTANTIVOS, ADJETIVOS } from '../../data/constants';

export const useShared = () => {
  const [playerNames, setPlayerNames] = useLocalStorage('mono_setup_names', ['', '', '']);

  const getRandomName = useCallback(() => {
    const sustantivo = SUSTANTIVOS[Math.floor(Math.random() * SUSTANTIVOS.length)];
    const adjetivo = ADJETIVOS[Math.floor(Math.random() * ADJETIVOS.length)];
    return `${sustantivo} ${adjetivo}`;
  }, []);

  return {
    playerNames,
    getRandomName,
  };
};