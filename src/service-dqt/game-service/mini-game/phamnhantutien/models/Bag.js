/**
 * Bag.js
 * Model xử lý túi đồ của người chơi
 */

import Item from "./Item.js";

export const BAG_TYPES = {
  TAY_NAI: "Tay nải",
  TUI_TRU_VAT: "Túi trữ vật",
  NHAN: "Nhẫn",
};

export class Bag {
  /**
   * @param {Object} data
   */
  constructor(data) {
    const d = data || {};
    this.type = d.type || BAG_TYPES.TAY_NAI;

    this.items = Array.isArray(d.items) ? d.items.map((it) => new Item(it)) : [];

    switch (this.type) {
      case BAG_TYPES.TAY_NAI:
        this.maxItems = 30; // số slot tối đa
        this.perItemMax = 1; // không giới hạn qty chung, nhưng tay nải thường lưu mỗi món như 1 entry
        this.dropOnDeath = true; // khi bị giết sẽ rơi toàn bộ
        break;
      case BAG_TYPES.TUI_TRU_VAT:
        this.maxItems = Infinity; // slot không giới hạn
        this.perItemMax = 5000; // mỗi món tối đa 5000 qty
        this.dropOnDeath = true;
        break;
      case BAG_TYPES.NHAN:
        this.maxItems = Infinity;
        this.perItemMax = Infinity; // không giới hạn qty
        this.dropOnDeath = false;
        break;
      default:
        this.maxItems = 30;
        this.perItemMax = 1;
        this.dropOnDeath = true;
    }
  }

  toJSON() {
    return {
      type: this.type,
      items: this.items.map((/** @type {Item} */ it) => it.toJSONPlayer()),
    };
  }

  getItems() {
    return this.items;
  }

  /**
   * Tìm item theo id (exact) hoặc trả danh sách
   * @param {string} id
   */
  findItemsById(id) {
    if (!id) return [];
    return this.items
      .map((it, idx) => ({ it, idx }))
      .filter((x) => String(x.it?.id || x.it?.itemId || "").toLowerCase() === String(id).toLowerCase());
  }

  getItemQty(itemId) {
    const it = this.items.find((x) => String(x.id).toLowerCase() === String(itemId).toLowerCase());
    return it ? Number(it.amount || 0) : 0;
  }

  clear() {
    this.items = [];
  }
}

export default Bag;
