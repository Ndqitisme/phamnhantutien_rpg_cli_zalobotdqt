/**
 * ServiceInitializer.js
 * Khởi tạo và đăng ký các service vào ServiceRegistry
 */

import { getServiceRegistry } from './ServiceRegistry.js';
import { GameService } from './GameService.js';
import { PlayerService } from './PlayerService.js';
import { CodeService } from './CodeService.js';
import { getDatabaseServiceInstance } from './DatabaseService.js';
import { getPlayerRepositoryInstance } from '../repositories/PlayerRepository.js';
import { getCodeRepositoryInstance } from '../repositories/CodeRepository.js';
import { getRealmRepositoryInstance } from '../repositories/RealmRepository.js';

/**
 * Đăng ký tất cả các service vào registry
 */
export function initializeServices(gameType) {
  const registry = getServiceRegistry();

  console.log(`[${gameType}] Tiến hành đăng ký các service...`);

  // Đăng ký các service
  registry.registerService('GameService', () => new GameService());
  registry.registerService('PlayerService', () => new PlayerService());
  registry.registerService('CodeService', () => new CodeService());
  registry.registerService('DatabaseService', () => getDatabaseServiceInstance());
  
  // Đăng ký các repository
  registry.registerService('PlayerRepository', () => getPlayerRepositoryInstance());
  registry.registerService('CodeRepository', () => getCodeRepositoryInstance());
  registry.registerService('RealmRepository', () => getRealmRepositoryInstance());
  
  return registry;
}

export default {
  initializeServices
}; 