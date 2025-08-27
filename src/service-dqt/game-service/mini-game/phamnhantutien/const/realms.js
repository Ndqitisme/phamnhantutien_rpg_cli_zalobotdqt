import { getServiceRegistry } from "../services/ServiceRegistry.js";

class RealmsData {
  constructor() {
    this.SPIRIT_ROOT_TYPES = {
      thien: "Thiên linh căn",
      song: "Song linh căn",
      tam: "Tam linh căn",
      tu: "Tứ linh căn",
      ngu: "Ngũ linh căn",
      none: "Chưa có linh căn",
    };
    this.SPIRIT_ROOT_ELEMENTS = ["kim", "moc", "thuy", "hoa", "tho"];
    this.SPIRIT_ROOT_ELEMENTS_MAP = {
      kim: "Kim",
      moc: "Mộc",
      thuy: "Thủy",
      hoa: "Hỏa",
      tho: "Thổ",
    };
    this.REALMS_DATA = [
      {
        id: "luyenkhi",
        name: "Luyện Khí Kỳ",
        type: "tiered",
        substages: [
          { tier: 1, name: "Tầng 1", maxExp: 100 },
          { tier: 2, name: "Tầng 2", maxExp: 120 },
          { tier: 3, name: "Tầng 3", maxExp: 140 },
          { tier: 4, name: "Tầng 4", maxExp: 160 },
          { tier: 5, name: "Tầng 5", maxExp: 180 },
          { tier: 6, name: "Tầng 6", maxExp: 200 },
          { tier: 7, name: "Tầng 7", maxExp: 220 },
          { tier: 8, name: "Tầng 8", maxExp: 240 },
          { tier: 9, name: "Tầng 9", maxExp: 260 },
          { tier: 10, name: "Tầng 10", maxExp: 280 },
          { tier: 11, name: "Tầng 11", maxExp: 300 },
          { tier: 12, name: "Tầng 12", maxExp: 320 },
          { tier: 13, name: "Tầng 13", maxExp: 360 },
        ],
        breakthroughAt: 9,
      },
      {
        id: "trucco",
        name: "Trúc Cơ",
        type: "substage",
        substages: [
          { tier: 1, name: "Sơ Kỳ", maxExp: 1000 },
          { tier: 2, name: "Trung Kỳ", maxExp: 1500 },
          { tier: 3, name: "Hậu Kỳ", maxExp: 2000 },
          { tier: 4, name: "Đại Viên Mãn", maxExp: 500 },
        ],
        breakthroughAt: 4,
      },
      {
        id: "ketdan",
        name: "Kết Đan",
        type: "substage",
        substages: [
          { tier: 1, name: "Sơ Kỳ", maxExp: 1500 },
          { tier: 2, name: "Trung Kỳ", maxExp: 3500 },
          { tier: 3, name: "Hậu Kỳ", maxExp: 5000 },
          { tier: 4, name: "Đại Viên Mãn", maxExp: 1000 },
        ],
        breakthroughAt: 4,
      },
      {
        id: "nguyenanh",
        name: "Nguyên Anh",
        type: "substage",
        substages: [
          { tier: 1, name: "Sơ Kỳ", maxExp: 3000 },
          { tier: 2, name: "Trung Kỳ", maxExp: 6000 },
          { tier: 3, name: "Hậu Kỳ", maxExp: 10000 },
          { tier: 4, name: "Đại Viên Mãn", maxExp: 2000 },
        ],
        breakthroughAt: 4,
      },
    ];
  }

  /**
   * Khởi tạo dữ liệu từ database
   */
  async initializeFromDatabase() {
    try {
      const registry = getServiceRegistry();

      /** @type {import('../repositories/RealmRepository.js').RealmRepository} */
      const realmRepository = registry.getService("RealmRepository");

      if (realmRepository) {
        const realmsData = await realmRepository.getRealmsData();
        this.SPIRIT_ROOT_TYPES = realmsData.spirit_root_types || this.SPIRIT_ROOT_TYPES;
        this.SPIRIT_ROOT_ELEMENTS = realmsData.spirit_root_elements || this.SPIRIT_ROOT_ELEMENTS;
        this.SPIRIT_ROOT_ELEMENTS_MAP = realmsData.spirit_root_elements_map || this.SPIRIT_ROOT_ELEMENTS_MAP;
        this.REALMS_DATA = realmsData.realms_data || this.REALMS_DATA;
      }
    } catch (error) {
      console.error("Lỗi khi khởi tạo realms từ database:", error);
    }
  }
}

const realmsData = new RealmsData();
export default realmsData;
