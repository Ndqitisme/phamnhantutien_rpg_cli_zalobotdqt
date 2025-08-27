/**
 * PlayerService.js
 * Service xử lý các thao tác liên quan đến người chơi
 */

import { getGameDataInstance } from "../core/GameData.js";
import { getGameManagerInstance } from "../core/GameManager.js";
import Player from "../models/Player.js";
import { findByIdOrNameFuzzy } from "../utils/TextSearch.js";
import { getServiceRegistry } from "./ServiceRegistry.js";
import { getPlayerRepositoryInstance } from "../repositories/PlayerRepository.js";

/**
 * Service xử lý các thao tác liên quan đến người chơi
 * @class PlayerService
 */
export class PlayerService {
  constructor() {
    /** @type {import('../core/GameData.js').GameData} */
    this.gameData = getGameDataInstance();

    /** @type {import('../core/GameManager.js').GameManager} */
    this.gameManager = getGameManagerInstance();

    // Các service khác sẽ được lấy từ registry khi cần
    this._registry = getServiceRegistry();
    
    /** @type {import('../repositories/PlayerRepository.js').PlayerRepository} */
    this.playerRepository = getPlayerRepositoryInstance();
  }

  /**
   * Lấy một service từ registry
   * @param {string} serviceName - Tên service
   * @returns {Object} Service instance
   */
  getService = (serviceName) => this._registry.getService(serviceName);

  /**
   * Tạo người chơi mới
   * @param {Object} userData - Thông tin người dùng
   * @returns {Player} - Đối tượng người chơi mới
   */
  async createNewPlayer(userData) {
    if (!userData || !userData.globalId) {
      throw new Error("Dữ liệu người dùng không hợp lệ");
    }

    const now = Date.now();

    const playerData = {
      globalId: userData.globalId,
      name: userData.zaloName || "Chiến binh vô danh",
      lastActivity: now,
      createdAt: now,
      knownIds: [userData.id],
    };

    const player = new Player(playerData);
    
    // Lưu vào database
    await this.playerRepository.createPlayer(playerData);
    
    // Cập nhật vào bộ nhớ cache
    this.gameData.setPlayerData(userData.globalId, player);

    return player;
  }

  /**
   * Hiển thị thống kê người chơi
   * @param {Player} player - Đối tượng người chơi
   */
  handleStatsCommand(player) {
    let message = "📊 THỐNG KÊ NHÂN VẬT\n\n";
    message += `• Tên: ${player.getName()}\n`;
    message += `• ${player.realm.getDisplayString()}\n`;
    message += `• ${player.realm.getSpiritRootInfo()}\n`;
    message += `• Tốc độ tu luyện: x${player.realm.getCultivationSpeedMultiplier().toFixed(2)}\n`;

    return { success: true, message };
  }

  /**
   * Tạo đối tượng Player từ dữ liệu người chơi có sẵn
   * @param {Object} rawPlayerData - Dữ liệu người chơi thô từ gameData
   * @returns {Player|null} - Đối tượng Player mới hoặc null nếu dữ liệu không hợp lệ
   */
  createPlayer(rawPlayerData) {
    if (!rawPlayerData) return null;
    return new Player(rawPlayerData);
  }

  /**
   * Lấy đối tượng Player từ playerId
   * @param {string} playerId - ID người chơi
   * @returns {Player|null} - Đối tượng Player hoặc null nếu không tìm thấy
   */
  getPlayerInstance(playerId) {
    return this.gameData.getPlayerByPlayerId(playerId);
  }

  /**
   * Lấy đối tượng Player từ globalId
   * @param {string} globalId - Global ID người chơi
   * @returns {Player|null} - Đối tượng Player hoặc null nếu không tìm thấy
   */
  getPlayerInstanceByGlobalId(globalId) {
    return this.gameData.getPlayerByGlobalId(globalId);
  }

  /**
   * Kiểm tra và xử lý hồi sinh nếu đã đủ thời gian
   * @param {Player} player - Đối tượng người chơi
   * @returns {Object} - Kết quả kiểm tra
   */
  checkRespawnStatus(player) {
    if (player.status !== "dead") {
      return { canRespawn: false, alreadyAlive: true };
    }

    const now = Date.now();
    if (!player.respawnTime || now >= player.respawnTime) {
      player.status = "online";
      player.respawnTime = null;
      player.save();

      return {
        canRespawn: true,
        alreadyAlive: false,
        message:
          "Sau khi tử trận vào lần trước, thân thể đã được tái tạo và linh lực được phục hồi một ít!\n" +
          "Hãy dùng lại lệnh lúc nãy bạn vừa dùng để tiếp tục hành trình!",
      };
    }

    const remainingTime = Math.ceil((player.respawnTime - now) / 1000);
    return {
      canRespawn: false,
      alreadyAlive: false,
      remainingTime,
      message: `Thân thể trọng thương, không thể làm gì cả!\nBạn sẽ được hồi sinh sau ${remainingTime} giây nữa.`,
    };
  }
}

let instance = null;

export function getPlayerServiceInstance() {
  if (!instance) {
    instance = new PlayerService();
  }
  return instance;
}
