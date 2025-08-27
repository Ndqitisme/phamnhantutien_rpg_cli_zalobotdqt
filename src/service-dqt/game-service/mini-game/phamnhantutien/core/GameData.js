/**
 * GameData.js
 * Lớp quản lý dữ liệu game và tương tác với cơ sở dữ liệu MySQL
 */

import { getServiceRegistry } from "../services/ServiceRegistry.js";
import Player from "../models/Player.js";
import { DatabaseService } from "../services/DatabaseService.js";
import { PlayerRepository } from "../repositories/PlayerRepository.js";
import { CodeRepository } from "../repositories/CodeRepository.js";

export class GameData {
  constructor() {
    this.registry = getServiceRegistry();
    this.playerData = {};
    this.codesData = { codes: [] };
    this.playerIdMap = new Map();

    this.dataChanged = {
      playerData: false,
      codesData: false
    };
  }

  /**
   * Lấy DatabaseService
   * @returns {DatabaseService} - DatabaseService instance
   */
  getDatabaseService() {
    return this.registry.getService('DatabaseService');
  }

  /**
   * Lấy PlayerRepository
   * @returns {PlayerRepository} - PlayerRepository instance
   */
  getPlayerRepository() {
    return this.registry.getService('PlayerRepository');
  }

  /**
   * Lấy CodeRepository
   * @returns {CodeRepository} - CodeRepository instance
   */
  getCodeRepository() {
    return this.registry.getService('CodeRepository');
  }

  /**
   * Tải toàn bộ dữ liệu từ database vào bộ nhớ cache
   * @returns {Promise<boolean>} Kết quả tải dữ liệu (thành công/thất bại)
   */
  async loadAllData() {
    try {
      // Khởi tạo database service nếu chưa có
      const dbService = this.getDatabaseService();
      if (!dbService.isInitialized) {
        await dbService.initialize();
      }

      // Tải dữ liệu người chơi từ database
      const playerRepository = this.getPlayerRepository();
      this.playerData = await playerRepository.getAllPlayers();
      
      // Tạo playerIdMap
      this.playerIdMap.clear();
      Object.entries(this.playerData).forEach(([globalId, player]) => {
        if (player.knownIds) {
          player.knownIds.forEach((playerId) => {
            this.playerIdMap.set(playerId, globalId);
          });
        }
      });

      // Tải dữ liệu codes từ database
      const codeRepository = this.getCodeRepository();
      const codes = await codeRepository.getAllCodes();
      this.codesData = { codes: codes.map(code => code.toJSON()) };

      return true;
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu từ database:", error);
      return false;
    }
  }

  /**
   * Lưu các dữ liệu đã thay đổi vào database
   * @returns {Promise<boolean>} Kết quả lưu dữ liệu
   */
  async saveChangedData() {
    try {
      if (this.dataChanged.playerData) {
        // Lưu dữ liệu người chơi vào database
        const playerRepository = this.getPlayerRepository();
        for (const [globalId, player] of Object.entries(this.playerData)) {
          await playerRepository.updatePlayer(globalId, player.toJSON());
        }
        this.dataChanged.playerData = false;
      }
      return true;
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu vào database:", error);
      return false;
    }
  }

  getPlayerData = () => this.playerData;
  getCodesData = () => this.codesData;

  getGlobalIdByPlayerId = (playerId) => this.playerIdMap.get(playerId);

  /**
   * Lấy thông tin người chơi từ Global ID
   * @param {string} globalId - Global ID của người chơi
   * @returns {Player|null} Thông tin người chơi hoặc null nếu không tìm thấy
   */
  getPlayerByGlobalId(globalId) {
    if (!globalId) return null;
    return this.playerData[globalId] || null;
  }

  /**
   * Lấy thông tin người chơi từ Player ID
   * @param {string} playerId - ID của người chơi
   * @returns {Player|null} Thông tin người chơi hoặc null nếu không tìm thấy
   */
  getPlayerByPlayerId(playerId) {
    if (!playerId) return null;
    const globalId = this.playerIdMap.get(playerId);
    if (!globalId) return null;
    return this.getPlayerByGlobalId(globalId);
  }

  setPlayerIdMap = (playerId, globalId) => this.playerIdMap.set(playerId, globalId);

  /**
   * Lưu đối tượng Player vào bộ nhớ
   * @param {string} globalId - Global ID của người chơi
   * @param {Player|Object} playerData - Đối tượng Player hoặc dữ liệu JSON
   */
  setPlayerData(globalId, playerData) {
    if (!(playerData instanceof Player)) {
      this.playerData[globalId] = new Player(playerData);
    } else {
      this.playerData[globalId] = playerData;
    }

    this.dataChanged.playerData = true;
  }

  markPlayerDataChanged = () => (this.dataChanged.playerData = true);
  markCodesDataChanged = () => (this.dataChanged.codesData = true);

  /**
   * Đánh dấu dữ liệu đã thay đổi và lưu nếu cần
   * @param {string} dataType - Loại dữ liệu cần đánh dấu
   * @param {boolean} saveImmediately - Có lưu ngay hay không
   */
  async markDataChanged(dataType, saveImmediately = false) {
    if (this.dataChanged.hasOwnProperty(dataType)) {
      this.dataChanged[dataType] = true;

      if (saveImmediately) {
        await this.saveData(dataType);
      }
    }
  }

  /**
   * Lưu một loại dữ liệu cụ thể
   * @param {string} dataType - Loại dữ liệu cần lưu
   * @returns {Promise<boolean>} - Kết quả lưu dữ liệu
   */
  async saveData(dataType) {
    try {
      switch (dataType) {
        case "playerData":
          // Lưu dữ liệu người chơi vào database
          const playerRepository = this.getPlayerRepository();
          for (const [globalId, player] of Object.entries(this.playerData)) {
            await playerRepository.updatePlayer(globalId, player.toJSON());
          }
          this.dataChanged.playerData = false;
          break;
        case "codesData":
          // Lưu dữ liệu codes vào database
          const codeRepository = this.getCodeRepository();
          for (const code of this.codesData.codes) {
            await codeRepository.updateCode(code.id, code);
          }
          this.dataChanged.codesData = false;
          break;
        default:
          return false;
      }
      return true;
    } catch (error) {
      console.error(`Lỗi khi lưu dữ liệu ${dataType} vào database:`, error);
      return false;
    }
  }
}

let instance = null;

export function getGameDataInstance() {
  if (!instance) {
    instance = new GameData();
  }
  return instance;
}
