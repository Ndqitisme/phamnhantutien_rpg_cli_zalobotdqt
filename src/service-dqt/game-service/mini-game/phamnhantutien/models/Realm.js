import realmsData from "../const/realms.js";
import { randomInt } from "../utils/GameUtils.js";

/**
 * Realm.js
 * Model quản lý trạng thái cảnh giới của người chơi (exp, level, inReal...) và spiritRoot
 */
export class Realm {
  constructor(data = {}) {
    const d = data || {};
    this.now = (d.now && { id: d.now.id, level: Number(d.now.level || 1) }) || {
      id: d.id || d.now?.id || "luyenkhi",
      level: Number(d.now?.level || d.level || 1),
    };
    this.inReal = d.inReal || this.now.id || "luyenkhi";
    this.level = Number(typeof d.level !== "undefined" ? d.level : this.now.level || 1);
    this.exp = Number(typeof d.exp !== "undefined" ? d.exp : 0);
    this.maxExp = Number(typeof d.maxExp !== "undefined" ? d.maxExp : 100);
    this.spiritRoot = d.spiritRoot || this.setNewSpiritRoot(this.generateRandomSpiritRootElements());
  }

  toJSON() {
    return {
      now: { id: this.now.id, level: this.now.level },
      inReal: this.inReal,
      level: this.level,
      exp: this.exp,
      maxExp: this.maxExp,
      spiritRoot: this.spiritRoot,
    };
  }

  getLevel() {
    return Number(this.level || this.now.level || 1);
  }

  getExp() {
    return Number(this.exp || 0);
  }

  getMaxExp() {
    return Number(this.maxExp || 100);
  }

  getPercentInLevel() {
    return `${(this.getExp() / this.getMaxExp() * 100).toFixed(2)}%`;
  }

  getDisplayString() {
    const percentInLevel = `(${this.getPercentInLevel()})`;
    const realmDef = realmsData.REALMS_DATA.find((r) => r.id === this.now.id);
    if (!realmDef) return `Cảnh giới: ${this.now.id} - Tầng ${this.now.level} - ${percentInLevel}`;
    const sub = realmDef.substages.find((s) => s.tier === this.now.level) || {};
    return `Cảnh giới: ${realmDef.name} - ${sub.name || this.now.level} - ${percentInLevel}`;
  }

  getSpiritRoot() {
    return this.spiritRoot || { type: "none", elements: [] };
  }

  setSpiritRoot(spiritRoot) {
    this.spiritRoot = spiritRoot || { type: "none", elements: [] };
    return this.spiritRoot;
  }

  /**
   * Lấy thông tin linh căn của người chơi
   * @returns {Object|null} Thông tin linh căn hoặc null nếu không tìm thấy
   */
  getSpiritRootInfo() {
    const sr = this.getSpiritRoot();
    const elMap = realmsData.SPIRIT_ROOT_ELEMENTS_MAP;
    const elStr = (sr.elements || []).map((e) => elMap[e] || e).join(", ") || "Chưa thiết lập";
    return `Linh căn: ${realmsData.SPIRIT_ROOT_TYPES[sr.type] || sr.type} (${elStr})`;
  }

  /**
   * Tạo danh sách linh căn ngẫu nhiên theo yêu cầu: 1..5 hệ, không trùng
   * @returns {string[]} ["kim"|"moc"|"thuy"|"hoa"|"tho"]
   */
  generateRandomSpiritRootElements() {
    const all = realmsData.SPIRIT_ROOT_ELEMENTS;
    const k = randomInt(1, 5);
    if (k === 5) return all;
    const pool = [...all];
    const chosen = [];
    for (let i = 0; i < k; i++) {
      const idx = randomInt(0, pool.length - 1);
      chosen.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return chosen;
  }

  /**
   * Thiết lập linh căn cho người chơi
   * @param {Array<string>} elements - Danh sách hệ: ["kim","moc","thuy","hoa","tho"]
   */
  setNewSpiritRoot(elements = []) {
    const allowed = new Set(realmsData.SPIRIT_ROOT_ELEMENTS);
    const unique = Array.from(new Set(elements.map((e) => String(e).toLowerCase()).filter((e) => allowed.has(e))));
    const n = unique.length;
    let type = "none";
    if (n === 1) type = "thien";
    else if (n === 2) type = "song";
    else if (n === 3) type = "tam";
    else if (n === 4) type = "tu";
    else if (n === 5) type = "ngu";
    return this.setSpiritRoot({ type, elements: unique });
  }

  /**
   * Hệ số tốc độ tu luyện theo linh căn (cao -> thấp): thiên > song > tam > tứ > ngũ
   * @returns {number}
   */
  getCultivationSpeedMultiplier() {
    const n = this.getSpiritRoot()?.elements?.length || 0;
    if (n <= 0) return 0;
    if (n === 1) return 3;
    if (n === 2) return 2.3;
    if (n === 3) return 1.6;
    if (n === 4) return 1.0;
    return 0.6;
  }

  /**
   * Thêm EXP cho realm, dùng multiplier xác định áp dụng exp
   * @param {number} baseExp
   * @param {number} multiplier
   */
  addExp(baseExp = 0) {
    const gainExp = Math.max(0, Number(baseExp || 0));
    const multiplier = this.getCultivationSpeedMultiplier();
    const appliedExp = Math.floor(gainExp * multiplier);

    const beforeLevel = this.getLevel();

    if (appliedExp <= 0) {
      return {
        baseExp: gainExp,
        multiplier,
        appliedExp: 0,
        beforeLevel,
        afterLevel: beforeLevel,
        exp: this.getExp(),
        maxExp: this.getMaxExp(),
      };
    }

    let level = beforeLevel;
    let exp = Number(this.exp || 0) + appliedExp;
    const realmId = this.inReal || this.now.id || "luyenkhi";
    const realmDefs = realmsData.REALMS_DATA;
    const realmDef = realmDefs.find((r) => r.id === realmId);

    if (realmDef) {
      while (true) {
        const sub = realmDef.substages.find((s) => s.tier === level);
        const maxExp = Number(sub?.maxExp || this.maxExp || 100);
        if (exp < maxExp) {
          this.exp = exp;
          this.maxExp = maxExp;
          break;
        }
        exp -= maxExp;
        const nextSub = realmDef.substages.find((s) => s.tier === level + 1);
        if (!nextSub) {
          this.exp = Math.min(exp, maxExp);
          this.maxExp = maxExp;
          break;
        }
        level += 1;
      }
    } else {
      this.exp = exp;
    }

    this.inReal = realmId;
    this.level = level;
    if (!this.now || typeof this.now !== "object") this.now = { id: realmId, level };
    else {
      this.now.id = realmId;
      this.now.level = level;
    }

    return {
      baseExp: gainExp,
      multiplier,
      appliedExp,
      beforeLevel,
      afterLevel: level,
      exp: this.exp,
      maxExp: this.maxExp,
    };
  }
}

export default Realm;
