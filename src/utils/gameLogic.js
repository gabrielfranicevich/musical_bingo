export const calculateMaxMonos = (numPlayers) => {
  return Math.max(1, Math.ceil(numPlayers / 2) - 1);
};
