/**
 * Item.js
 * Model chung cho Item mẫu (template) và Item trên người chơi
 */

export class Item {
  /**
   * Tạo Item từ data. Hỗ trợ cả dạng template (catalog) và player item (có qty, stats)
   * @param {Object} data
   */
  constructor(data = {}) {
    // Thông tin chung (template)
    this.id = String(data.id || data.itemId || data._id || "").trim();
    this.name = data.name || data.label || this.id || "Unknown Item";
    this.type = data.type || data.category || "misc";
    this.description = data.description || data.desc || "";
    this.skillId = data.skillId || data.skill || null;
    this.qty = typeof data.qty !== 'undefined' ? Number(data.qty || 0) : typeof data.amount !== 'undefined' ? Number(data.amount || 0) : undefined;
    this.stats = data.stats && typeof data.stats === 'object' ? { ...data.stats } : undefined;
    this.instanceId = data.instanceId || data.uid || null;

  }

  // ----- Query helpers -----
  isTemplate() {
    return typeof this.qty === 'undefined' && typeof this.stats === 'undefined' && !this.instanceId;
  }

  isPlayerItem() {
    return !this.isTemplate();
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getType() {
    return this.type;
  }

  getDescription() {
    return this.description;
  }

  getFilter() {
    return this.filter;
  }

  getSkillId() {
    return this.skillId;
  }

  getQty() {
    return typeof this.qty === 'number' ? this.qty : 0;
  }

  setQty(qty) {
    if (typeof qty === 'number') this.qty = Math.max(0, Math.floor(qty));
    return this.qty;
  }

  addQty(qty) {
    if (typeof qty !== 'number' || qty <= 0) return this.getQty();
    this.qty = this.getQty() + Math.floor(qty);
    return this.qty;
  }

  removeQty(qty) {
    if (typeof qty !== 'number' || qty <= 0) return this.getQty();
    this.qty = Math.max(0, this.getQty() - Math.floor(qty));
    return this.qty;
  }

  getStats() {
    return this.stats || {};
  }

  setStats(stats) {
    if (!stats || typeof stats !== 'object') return this.stats;
    this.stats = { ...(this.stats || {}), ...stats };
    return this.stats;
  }

  mergeStats(stats) {
    return this.setStats(stats);
  }

  toJSON() {
    const base = {
      id: this.id,
      name: this.name,
      type: this.type,
      description: this.description,
      skillId: this.skillId,
    };
    if (this.isPlayerItem()) {
      base.qty = this.getQty();
      if (this.stats) base.stats = { ...this.stats };
      if (this.instanceId) base.instanceId = this.instanceId;
    }
    return base;
  }

  toJSONPlayer() {
    const fields = [
      ["id", this.id],
      ["qty", this.getQty()],
      ["stats", this.stats],
      ["instanceId", this.instanceId],
      ["skillId", this.skillId],
    ];
    return fields.reduce((obj, [key, value]) => {
      if (value !== undefined && value !== null) obj[key] = value;
      return obj;
    }, {});
  }
}

export default Item;


