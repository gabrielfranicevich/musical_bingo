/**
 * Utility functions for the game server
 */
const os = require('os');

/**
 * Generate a random 4-letter room code
 */
function generateRoomCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Get local IP address
 */
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

/**
 * Get IP subnet (first 3 octets for /24 matching)
 */
function getIpSubnet(ip) {
  if (!ip) return null;
  const cleanIp = ip.replace(/^::ffff:/, '');
  const parts = cleanIp.split('.');
  if (parts.length === 4) {
    return parts.slice(0, 3).join('.');
  }
  return null;
}

/**
 * Sanitize player name
 */
function sanitizeName(name) {
  if (!name) return 'Jugador';
  return name.replace(/[^\w\s]/gi, '').substring(0, 30).trim() || 'Jugador';
}

/**
 * Get next active player index (skip disconnected)
 */
function getNextActivePlayerIndex(room, currentIndex) {
  const order = room.gameData.playerOrderIds;
  let nextIndex = (currentIndex + 1) % order.length;
  let loops = 0;
  while (loops < order.length) {
    const playerId = order[nextIndex];
    const player = room.players.find(p => p.playerId === playerId);
    if (player && player.connected !== false) {
      return nextIndex;
    }
    nextIndex = (nextIndex + 1) % order.length;
    loops++;
  }
  return currentIndex;
}

module.exports = {
  generateRoomCode,
  getLocalIp,
  getIpSubnet,
  sanitizeName,

  getNextActivePlayerIndex
};
