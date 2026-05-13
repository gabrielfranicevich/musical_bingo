/**
 * Utility functions for managing custom word lists in localStorage
 */

const STORAGE_KEY = 'customWordLists';

/**
 * Load all custom word lists from localStorage
 * @returns {Object} Object with listName -> words[] mapping
 */
export const loadWordLists = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading custom word lists:', error);
    return {};
  }
};

/**
 * Save a custom word list
 * @param {string} listName - Name of the list
 * @param {Array<string>} words - Array of words
 * @returns {boolean} Success status
 */
export const saveWordList = (listName, words) => {
  try {
    const lists = loadWordLists();
    lists[listName] = words;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    return true;
  } catch (error) {
    console.error('Error saving word list:', error);
    return false;
  }
};

/**
 * Delete a custom word list
 * @param {string} listName - Name of the list to delete
 * @returns {boolean} Success status
 */
export const deleteWordList = (listName) => {
  try {
    const lists = loadWordLists();
    delete lists[listName];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    return true;
  } catch (error) {
    console.error('Error deleting word list:', error);
    return false;
  }
};

/**
 * Rename a custom word list
 * @param {string} oldName - Current name
 * @param {string} newName - New name
 * @returns {boolean} Success status
 */
export const renameWordList = (oldName, newName) => {
  try {
    const lists = loadWordLists();
    if (lists[oldName]) {
      lists[newName] = lists[oldName];
      delete lists[oldName];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error renaming word list:', error);
    return false;
  }
};

/**
 * Validate word list format
 * @param {Array<string>} words - Words to validate
 * @returns {{valid: boolean, errors: Array<string>}} Validation result
 */
export const validateWordList = (words) => {
  const errors = [];

  if (!Array.isArray(words)) {
    errors.push('La lista debe ser un arreglo de palabras');
    return { valid: false, errors };
  }

  if (words.length === 0) {
    errors.push('La lista debe contener al menos una palabra');
    return { valid: false, errors };
  }

  const invalidWords = words.filter(w => !w || typeof w !== 'string' || w.trim() === '');
  if (invalidWords.length > 0) {
    errors.push('Todas las palabras deben ser texto válido');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
