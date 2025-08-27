/**
 * PlayerRepository.js
 * Repository xử lý tương tác với bảng player trong database
 */

import { getDatabaseServiceInstance } from "../services/DatabaseService.js";
import Player from "../models/Player.js";

export class PlayerRepository {
  constructor() {
    this.dbService = getDatabaseServiceInstance();
  }

  /**
   * Lấy tất cả người chơi
   */
  async getAllPlayers() {
    try {
      const query = `
        SELECT * FROM player 
        ORDER BY createdAt DESC
      `;
      
      const rows = await this.dbService.execute(query);
      const players = {};
      
      for (const row of rows) {
        // Chuyển đổi dữ liệu từ database sang format JSON
        const playerData = {
          globalId: row.globalId,
          name: row.name,
          createdAt: row.createdAt,
          status: row.status,
          lastActivity: row.lastActivity,
          guild: row.guild ? JSON.parse(row.guild) : {},
          skills: row.skills ? JSON.parse(row.skills) : { active: [], passive: [] },
          location: row.location ? JSON.parse(row.location) : {},
          body: row.body ? JSON.parse(row.body) : { head: null, body: null, arm: null, leg: null },
          bag: row.bag ? JSON.parse(row.bag) : { type: "Tay nải", items: [] },
          realm: row.realm ? JSON.parse(row.realm) : { now: { id: "luyenkhi", level: 1 }, level: 1, exp: 0, maxExp: 100 },
          stats: row.stats ? JSON.parse(row.stats) : {},
          quests: row.quests ? JSON.parse(row.quests) : {},
          knownIds: row.knownIds ? JSON.parse(row.knownIds) : [],
          redeemedCodes: row.redeemedCodes ? JSON.parse(row.redeemedCodes) : [],
          respawnTime: row.respawnTime
        };
        
        players[row.globalId] = new Player(playerData);
      }
      
      return players;
    } catch (error) {
      console.error("Lỗi khi lấy tất cả người chơi:", error);
      return {};
    }
  }

  /**
   * Lấy người chơi theo Global ID
   */
  async getPlayerByGlobalId(globalId) {
    try {
      const query = "SELECT * FROM player WHERE globalId = ?";
      const rows = await this.dbService.execute(query, [globalId]);
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      const playerData = this._convertRowToPlayerData(row);
      return new Player(playerData);
    } catch (error) {
      console.error("Lỗi khi lấy người chơi theo Global ID:", error);
      return null;
    }
  }

  /**
   * Lấy người chơi theo Player ID (từ knownIds)
   */
  async getPlayerByPlayerId(playerId) {
    try {
      const query = "SELECT * FROM player WHERE JSON_CONTAINS(knownIds, ?)";
      const rows = await this.dbService.execute(query, [JSON.stringify(playerId)]);
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      const playerData = this._convertRowToPlayerData(row);
      return new Player(playerData);
    } catch (error) {
      console.error("Lỗi khi lấy người chơi theo Player ID:", error);
      return null;
    }
  }

  /**
   * Tạo người chơi mới
   */
  async createPlayer(playerData) {
    try {
      const query = `
        INSERT INTO player (
          globalId, name, createdAt, status, lastActivity, 
          guild, skills, location, body, bag, realm, 
          stats, quests, knownIds, redeemedCodes, respawnTime
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        playerData.globalId,
        playerData.name,
        playerData.createdAt || Date.now(),
        playerData.status || 'online',
        playerData.lastActivity || Date.now(),
        JSON.stringify(playerData.guild || {}),
        JSON.stringify(playerData.skills || { active: [], passive: [] }),
        JSON.stringify(playerData.location || {}),
        JSON.stringify(playerData.body || { head: null, body: null, arm: null, leg: null }),
        JSON.stringify(playerData.bag || { type: "Tay nải", items: [] }),
        JSON.stringify(playerData.realm || { now: { id: "luyenkhi", level: 1 }, level: 1, exp: 0, maxExp: 100 }),
        JSON.stringify(playerData.stats || {}),
        JSON.stringify(playerData.quests || {}),
        JSON.stringify(playerData.knownIds || []),
        JSON.stringify(playerData.redeemedCodes || []),
        playerData.respawnTime || null
      ];
      
      await this.dbService.execute(query, params);
      return true;
    } catch (error) {
      console.error("Lỗi khi tạo người chơi mới:", error);
      return false;
    }
  }

  /**
   * Cập nhật người chơi
   */
  async updatePlayer(globalId, playerData) {
    try {
      const query = `
        UPDATE player SET
          name = ?, status = ?, lastActivity = ?, 
          guild = ?, skills = ?, location = ?, body = ?, bag = ?, realm = ?, 
          stats = ?, quests = ?, knownIds = ?, redeemedCodes = ?, respawnTime = ?
        WHERE globalId = ?
      `;
      
      const params = [
        playerData.name,
        playerData.status,
        playerData.lastActivity || Date.now(),
        JSON.stringify(playerData.guild || {}),
        JSON.stringify(playerData.skills || { active: [], passive: [] }),
        JSON.stringify(playerData.location || {}),
        JSON.stringify(playerData.body || { head: null, body: null, arm: null, leg: null }),
        JSON.stringify(playerData.bag || { type: "Tay nải", items: [] }),
        JSON.stringify(playerData.realm || { now: { id: "luyenkhi", level: 1 }, level: 1, exp: 0, maxExp: 100 }),
        JSON.stringify(playerData.stats || {}),
        JSON.stringify(playerData.quests || {}),
        JSON.stringify(playerData.knownIds || []),
        JSON.stringify(playerData.redeemedCodes || []),
        playerData.respawnTime || null,
        globalId
      ];
      
      await this.dbService.execute(query, params);
      return true;
    } catch (error) {
      console.error("Lỗi khi cập nhật người chơi:", error);
      return false;
    }
  }

  /**
   * Xóa người chơi
   */
  async deletePlayer(globalId) {
    try {
      const query = "DELETE FROM player WHERE globalId = ?";
      await this.dbService.execute(query, [globalId]);
      return true;
    } catch (error) {
      console.error("Lỗi khi xóa người chơi:", error);
      return false;
    }
  }

  /**
   * Tìm kiếm người chơi theo tên
   */
  async searchPlayersByName(name) {
    try {
      const query = "SELECT * FROM player WHERE name LIKE ?";
      const rows = await this.dbService.execute(query, [`%${name}%`]);
      
      const players = [];
      for (const row of rows) {
        const playerData = this._convertRowToPlayerData(row);
        players.push(new Player(playerData));
      }
      
      return players;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm người chơi:", error);
      return [];
    }
  }

  /**
   * Lấy số lượng người chơi online
   */
  async getOnlinePlayerCount() {
    try {
      const query = "SELECT COUNT(*) as count FROM player WHERE status = 'online'";
      const rows = await this.dbService.execute(query);
      return rows[0]?.count || 0;
    } catch (error) {
      console.error("Lỗi khi đếm người chơi online:", error);
      return 0;
    }
  }

  /**
   * Chuyển đổi dữ liệu từ database row sang player data
   */
  _convertRowToPlayerData(row) {
    return {
      globalId: row.globalId,
      name: row.name,
      createdAt: row.createdAt,
      status: row.status,
      lastActivity: row.lastActivity,
      guild: row.guild ? JSON.parse(row.guild) : {},
      skills: row.skills ? JSON.parse(row.skills) : { active: [], passive: [] },
      location: row.location ? JSON.parse(row.location) : {},
      body: row.body ? JSON.parse(row.body) : { head: null, body: null, arm: null, leg: null },
      bag: row.bag ? JSON.parse(row.bag) : { type: "Tay nải", items: [] },
      realm: row.realm ? JSON.parse(row.realm) : { now: { id: "luyenkhi", level: 1 }, level: 1, exp: 0, maxExp: 100 },
      stats: row.stats ? JSON.parse(row.stats) : {},
      quests: row.quests ? JSON.parse(row.quests) : {},
      knownIds: row.knownIds ? JSON.parse(row.knownIds) : [],
      redeemedCodes: row.redeemedCodes ? JSON.parse(row.redeemedCodes) : [],
      respawnTime: row.respawnTime
    };
  }
}

let instance = null;

export function getPlayerRepositoryInstance() {
  if (!instance) {
    instance = new PlayerRepository();
  }
  return instance;
}

export default {
  PlayerRepository,
  getPlayerRepositoryInstance
};
