/**
 * Player.js
 * Module xử lý logic liên quan đến người chơi
 */

import { Entity } from "../core/Entity.js";
import { getGameDataInstance } from "../core/GameData.js";
import Bag from "./Bag.js";
import Realm from "./Realm.js";

export class Player extends Entity {
  constructor(playerData) {
    super(playerData.globalId, playerData.name || "Tán tu vô danh");
    this.globalId = playerData.globalId;
    this.createdAt = playerData.createdAt || Date.now();
    this.status = playerData.status || "online";
    this.lastActivity = playerData.lastActivity || Date.now();
    this.location = playerData.location || {};
    this.guild = playerData.guild || {};
    this.body = playerData.body || {
      head: null,
      body: null,
      arm: null,
      leg: null,
    };
    this.bag = new Bag(playerData.bag);
    this.skills = playerData.skills || {
      active: [],
      passive: [],
    };
    this.realm = new Realm(playerData.realm);
    this.stats = playerData.stats || {};
    this.quests = playerData.quests || {
      main: [],
    };
    this.knownIds = playerData.knownIds || [];
    this.redeemedCodes = Array.isArray(playerData.redeemedCodes) ? playerData.redeemedCodes : [];
    this.respawnTime = playerData.respawnTime || null;
  }

  /**
   * Cập nhật dữ liệu người chơi vào bộ nhớ
   */
  save() {
    /** @type {import('../core/GameData.js').GameData} */
    const gameData = getGameDataInstance();
    gameData.setPlayerData(this.globalId, this);
    gameData.markPlayerDataChanged();

    return true;
  }

  /**
   * Chuyển đổi dữ liệu người chơi thành JSON để lưu trữ
   * @returns {Object} - Dữ liệu người chơi dạng JSON
   */
  toJSON() {
    return {
      globalId: this.globalId,
      name: this.getName(),
      createdAt: this.createdAt,
      status: this.status,
      guild: this.guild,
      skills: this.skills,
      lastActivity: this.lastActivity,
      location: this.location,
      body: this.body,
      bag: this.bag.toJSON(),
      realm: this.realm.toJSON(),
      stats: this.stats,
      quests: this.quests,
      knownIds: this.knownIds,
      redeemedCodes: this.redeemedCodes,
      respawnTime: this.respawnTime,
    };
  }

  /**
   * Lấy ID toàn cục của người chơi
   * @returns {string} - ID toàn cục
   */
  getGlobalId() {
    return this.globalId;
  }

  /**
   * Cộng kinh nghiệm cảnh giới, chịu ảnh hưởng bởi linh căn
   * @param {number} baseExp - EXP cơ bản (chưa nhân hệ số)
   * @returns {{baseExp:number, multiplier:number, appliedExp:number, beforeLevel:number, afterLevel:number, exp:number, maxExp:number}}
   */
  addExp(baseExp = 0) {
    const res = this.realm.addExp(baseExp);
    this.save();
    return res;
  }

  /**
   * Cập nhật idPoint của người chơi
   * @param {number} idPoint - ID điểm
   */
  setIdPoint(idPoint) {
    if (typeof idPoint === "undefined" || idPoint === null) return;
    const nextMove = Math.max(Number(this.quests.idPoint || 0), Number(idPoint || 0));
    this.quests.idPoint = nextMove;
    this.save();
  }

  /**
   * Kiểm tra có thể học công pháp/kỹ năng hệ X hay không
   * - Thiên linh căn: chỉ học đúng hệ duy nhất
   * - Đa linh căn: chỉ học các hệ thuộc danh sách linh căn
   * @param {string} element - kim|moc|thuy|hoa|tho
   * @returns {boolean}
   */
  canLearnElement(element) {
    if (!element) return false;
    const el = String(element).toLowerCase();
    const elements = this.realm.getSpiritRoot()?.elements || [];
    if (elements.length === 0) return false;
    return elements.includes(el);
  }
}

export default Player;
