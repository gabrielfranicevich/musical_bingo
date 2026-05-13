import gameData from './gameData.json';

export const THEMES = gameData.THEMES;
export const CHART_ITEMS = gameData.CHART_ITEMS;
export const SUSTANTIVOS = gameData.SUSTANTIVOS;
export const ADJETIVOS = gameData.ADJETIVOS;

// All genre keys (same in both CHART_ITEMS and THEMES)
export const GENRES = Object.keys(CHART_ITEMS);

// Flatten CHART_ITEMS strings for selected genres → bingo card pool
export const getCardItemsForGenres = (genres) =>
  genres.flatMap(g => CHART_ITEMS[g] || []);

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
