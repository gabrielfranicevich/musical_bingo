import gameData from './gameData.json';

export const THEMES = gameData.THEMES;
export const SUSTANTIVOS = gameData.SUSTANTIVOS;
export const ADJETIVOS = gameData.ADJETIVOS;

// All genre keys (derived from THEMES)
export const GENRES = Object.keys(THEMES);

// Dynamically generate card items and difficulties for selected genres
export const getCardItemsForGenres = (genres) => {
  const activeSongs = genres.flatMap(g => THEMES[g] || []);
  const N = activeSongs.length;
  if (N === 0) return [];

  const itemFrequencies = new Map();
  activeSongs.forEach(song => {
    (song.chart_items || []).forEach(item => {
      itemFrequencies.set(item, (itemFrequencies.get(item) || 0) + 1);
    });
  });

  return Array.from(itemFrequencies.entries()).map(([label, count]) => {
    const p = count / N;
    // Lower frequency means higher difficulty (1-10)
    const difficulty = Math.max(1, Math.min(10, 11 - Math.ceil(p * 30)));
    return { label, difficulty };
  });
};

// Flatten THEMES songs for selected genres → DJ playback queue
export const getSongsForGenres = (genres) =>
  genres.flatMap(g => THEMES[g] || []);

// Default bingo configuration
export const DEFAULT_MATRIX = { rows: 4, cols: 4 };

export const DEFAULT_PATTERNS = [
  { id: 'horizontal', name: 'Fila horizontal', type: 'preset', enabled: true },
  { id: 'vertical', name: 'Columna vertical', type: 'preset', enabled: true },
  { id: 'diagonal', name: 'Diagonal', type: 'preset', enabled: false }
];
