/**
 * Parses a comma-separated string into an array of words/phrases.
 * Handles spaces after commas and ignores empty entries.
 * Preserves spaces within words.
 *
 * Examples:
 * "foo, bar" -> ["foo", "bar"]
 * "foo,  bar" -> ["foo", "bar"]
 * "San Francisco, New York" -> ["San Francisco", "New York"]
 *
 * @param {string} input - The input string to parse
 * @returns {string[]} An array of parsed non-empty strings
 */
export const parseWordListInput = (input) => {
  if (!input) return [];
  return input
    .split(',')
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
};

/**
 * Formats an array of words into a comma-separated string for input.
 *
 * Example:
 * ["foo", "bar"] -> "foo, bar"
 *
 * @param {string[]} words - Array of words
 * @returns {string} Formatted string
 */
export const formatWordListForInput = (words) => {
  if (!Array.isArray(words)) return '';
  return words.join(', ');
};
