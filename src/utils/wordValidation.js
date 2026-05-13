/**
 * Text normalization and word validation utilities
 * Supports accent removal and typo tolerance (1 character difference)
 */

/**
 * Normalize text by removing accents and converting to lowercase
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
export const normalizeText = (text) => {
  if (!text) return '';

  // Convert to lowercase first
  const lower = text.toLowerCase();

  // Remove accents using NFD normalization and removing diacritics
  return lower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Calculate Levenshtein distance between two strings
 * Returns the minimum number of single-character edits (insertions, deletions, or substitutions)
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Edit distance
 */
export const levenshteinDistance = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create a 2D array for dynamic programming
  const dp = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    dp[0][j] = j;
  }

  // Fill the dp table
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }

  return dp[len1][len2];
};

/**
 * Validate if a guessed word matches the actual word
 * Applies text normalization and allows up to 1 character difference
 * @param {string} guess - The guessed word
 * @param {string} actual - The actual word
 * @returns {boolean} True if the guess is valid
 */
export const isWordValid = (guess, actual) => {
  if (!guess || !actual) return false;

  // Normalize both words
  const normalizedGuess = normalizeText(guess.trim());
  const normalizedActual = normalizeText(actual.trim());

  // Check exact match first
  if (normalizedGuess === normalizedActual) {
    return true;
  }

  // Check if within 1 character edit distance
  const distance = levenshteinDistance(normalizedGuess, normalizedActual);
  return distance <= 1;
};
