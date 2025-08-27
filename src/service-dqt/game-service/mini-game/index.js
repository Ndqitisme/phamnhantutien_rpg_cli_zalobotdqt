const activeGames = new Map(); // Map<threadId, Map<gameType, gameInstance>>
const gamePlayers = new Map(); // Map<threadId_gameType, Map<playerId, playerInfo>>

export function getActiveGames() {
  return activeGames;
}

export function getGamePlayers() {
  return gamePlayers;
}

export function getGamePlayerKey(threadId, gameType) {
  return `${threadId}_${gameType}`;
}

export function addPlayer(threadId, gameType, playerId, playerName) {
  const key = getGamePlayerKey(threadId, gameType);
  if (!gamePlayers.has(key)) {
    gamePlayers.set(key, new Map());
  }
  gamePlayers.get(key).set(playerId, {
    id: playerId,
    name: playerName,
    joinedAt: new Date(),
  });
}

export function getPlayerInfo(threadId, gameType, playerId) {
  const key = getGamePlayerKey(threadId, gameType);
  if (!gamePlayers.has(key)) return null;
  return gamePlayers.get(key).get(playerId);
}

export function getAllPlayers(threadId, gameType) {
  const key = getGamePlayerKey(threadId, gameType);
  if (!gamePlayers.has(key)) return [];
  return Array.from(gamePlayers.get(key).values());
}

export function checkPlayerJoined(threadId, gameType, playerId) {
  const key = getGamePlayerKey(threadId, gameType);
  if (!gamePlayers.has(key)) return false;
  return gamePlayers.get(key).has(playerId);
}

export function removePlayer(threadId, gameType, playerId) {
  const key = getGamePlayerKey(threadId, gameType);
  if (gamePlayers.has(key)) {
    gamePlayers.get(key).delete(playerId);
  }
}

export function isPlayerInGame(threadId, gameType, playerId) {
  const key = getGamePlayerKey(threadId, gameType);
  return gamePlayers.has(key) && gamePlayers.get(key).has(playerId);
}

export function addGame(threadId, gameType, gameInstance) {
  let threadGames = activeGames.get(threadId);
  if (!threadGames || !(threadGames instanceof Map)) {
    threadGames = new Map();
    activeGames.set(threadId, threadGames);
  }
  threadGames.set(gameType, gameInstance);
}

export function removeGame(threadId, gameType, delPlayer = true) {
  const threadGames = activeGames.get(threadId);
  if (threadGames) {
    threadGames.delete(gameType);
    if (threadGames.size === 0) {
      activeGames.delete(threadId);
    }
    if (delPlayer) {
      const key = getGamePlayerKey(threadId, gameType);
      gamePlayers.delete(key);
    }
  }
}
