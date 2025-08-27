/**
 * CodeService.js
 * Service xử lý các thao tác liên quan đến code quà tặng
 */

import { getGameDataInstance } from "../core/GameData.js";
import { getGameManagerInstance } from "../core/GameManager.js";
import { Code } from "../models/Code.js";
import Player from "../models/Player.js";
import { getServiceRegistry } from "./ServiceRegistry.js";
import { PlayerService } from "./PlayerService.js";
import { getCodeRepositoryInstance } from "../repositories/CodeRepository.js";

export class CodeService {
  constructor() {
    /** @type {import('../core/GameData.js').GameData} */
    this.gameData = getGameDataInstance();

    /** @type {import('../core/GameManager.js').GameManager} */
    this.gameManager = getGameManagerInstance();

    // Lấy registry để truy cập các service khi cần
    this._registry = getServiceRegistry();

    // Code repository
    /** @type {import('../repositories/CodeRepository.js').CodeRepository} */
    this.codeRepository = getCodeRepositoryInstance();

    this.codes = [];
    this.codesById = new Map();
  }

  /**
   * Lấy một service từ registry
   * @param {string} serviceName - Tên service
   * @returns {Object} Service instance
   */
  getService = (serviceName) => this._registry.getService(serviceName);

  /**
   * Lấy PlayerService
   * @returns {PlayerService}
   */
  get playerService() {
    return this.getService("PlayerService");
  }

  /**
   * Tải dữ liệu code từ database
   */
  async loadCodes() {
    try {
      this.codes = await this.codeRepository.getAllCodes();

      // Tạo map lưu trữ code theo ID để tìm kiếm nhanh
      this.codesById.clear();
      for (const code of this.codes) {
        this.codesById.set(code.getId(), code);
      }
    } catch (error) {
      console.error("Lỗi khi tải codes từ database:", error);
      this.codes = [];
    }

    return this.codes;
  }

  /**
   * Tìm code theo ID
   * @param {string} id - ID của code
   * @returns {Promise<Code|null>} - Đối tượng code hoặc null nếu không tìm thấy
   */
  async getCodeById(id) {
    if (!id) return null;

    if (this.codesById.size === 0) {
      await this.loadCodes();
    }

    return this.codesById.get(id) || null;
  }

  /**
   * Tìm code theo mã code
   * @param {string} code - Mã code
   * @returns {Promise<Code>} - Đối tượng code hoặc null nếu không tìm thấy
   */
  async getCodeByCode(code) {
    if (!code) return null;

    if (this.codes.length === 0) {
      await this.loadCodes();
    }

    return this.codes.find((c) => c.code === code) || null;
  }

  /**
   * Tạo code mới
   * @param {Object} codeData - Dữ liệu code
   * @returns {Promise<Object>} - Kết quả tạo code
   */
  async createCode(codeData) {
    const existingCode = await this.getCodeByCode(codeData.code);
    if (existingCode) {
      return {
        success: false,
        message: "❌ Mã code đã tồn tại!",
      };
    }

    const code = new Code({
      id: `code_${Date.now()}`,
      ...codeData,
      createdAt: Date.now(),
    });

    // Lưu code vào database
    const success = await this.codeRepository.createCode(codeData);
    if (!success) {
      return {
        success: false,
        message: "❌ Lỗi khi lưu code vào database!",
      };
    }

    // Cập nhật danh sách code trong bộ nhớ
    await this.loadCodes();

    return {
      success: true,
      message: `✅ Đã tạo code "${code.code}" thành công!`,
    };
  }

  /**
   * Xóa code
   * @param {string} codeId - ID của code
   * @returns {Promise<Object>} - Kết quả xóa code
   */
  async deleteCode(codeId) {
    const code = await this.getCodeById(codeId);
    if (!code) {
      return {
        success: false,
        message: "❌ Không tìm thấy code!",
      };
    }

    // Xóa code từ database
    const success = await this.codeRepository.deleteCode(codeId);
    if (!success) {
      return {
        success: false,
        message: "❌ Lỗi khi xóa code từ database!",
      };
    }

    // Cập nhật danh sách code trong bộ nhớ
    await this.loadCodes();

    return {
      success: true,
      message: `✅ Đã xóa code "${code.code}"!`,
    };
  }

  /**
   * Lấy danh sách codes khả dụng
   * @returns {Promise<Array>} - Danh sách codes
   */
  async getAvailableCodes() {
    if (this.codes.length === 0) {
      await this.loadCodes();
    }

    const availableCodes = [];
    const currentTime = Date.now();

    for (const code of this.codes) {
      if (code.isActive && (!code.expireDate || currentTime <= code.expireDate)) {
        availableCodes.push({
          code: code.code,
          name: code.name,
          description: code.description,
        });
      }
    }

    return availableCodes;
  }

  /**
   * Xử lý lệnh code với các tham số
   * @param {Player} player - Đối tượng người chơi
   * @param {string} commandString - Chuỗi lệnh đầy đủ
   * @returns {Promise<Object>} - Kết quả xử lý lệnh
   */
  async handleCode(player, commandString) {
    if (!player.redeemedCodes) {
      player.redeemedCodes = [];
    }

    const args = commandString
      .trim()
      .split(/\s+/)
      .filter((arg) => arg.length > 0);

    // Nếu không có tham số, hiển thị hướng dẫn
    if (args.length === 0) {
      let message =
        "🎁 HỆ THỐNG MÃ QUÀ TẶNG:\n\n" +
        "- Nhập `code list` để xem danh sách mã hiện có\n" +
        "- Nhập `code [mã]` để đổi quà từ mã\n\n" +
        "📝 Lưu ý: Mỗi mã chỉ có thể sử dụng một lần, một số mã có thể có hạn sử dụng.\n" +
        "Các mã quà tặng có thể cung cấp nhiều phần thưởng hấp dẫn như vàng, kinh nghiệm, vật phẩm, v.v.";

      // Thêm hướng dẫn cho admin
      if (player.isAdmin) {
        message +=
          "\n\n👑 LỆNH DÀNH CHO QUẢN TRỊ VIÊN:\n" +
          "- `code create [id] [name] [description] [maxUses] [gold] [exp]`: Tạo mã mới\n" +
          "- `code delete [id]`: Xóa mã code";
      }

      return {
        success: true,
        message: message,
      };
    }

    const action = args[0].toLowerCase();

    // Hiển thị danh sách codes
    if (action === "list") {
      const availableCodes = await this.getAvailableCodes();

      if (availableCodes.length === 0) {
        return {
          success: true,
          message: "📋 Hiện không có mã quà tặng nào khả dụng.",
        };
      }

      let message = "📋 DANH SÁCH MÃ QUÀ TẶNG KHẢ DỤNG:\n\n";
      availableCodes.forEach((code) => {
        const used = player.redeemedCodes.includes(code.code) ? "✅ Đã sử dụng" : "⬜ Chưa sử dụng";
        message += `📦 ${code.code}: ${code.name}\n`;
        message += `   📝 ${code.description}\n`;
        message += `   🎯 Trạng thái: ${used}\n\n`;
      });

      message += "💡 Sử dụng lệnh `code [mã]` để nhận quà từ mã.";

      return {
        success: true,
        message: message,
      };
    }

    // Tạo code mới (chỉ admin)
    if (action === "create") {
      if (!player.isAdmin) {
        return {
          success: false,
          message: "❌ Bạn không có quyền sử dụng chức năng này!",
        };
      }

      if (args.length < 6) {
        return {
          success: false,
          message:
            "📝 Cú pháp: `code create [id] [name] [description] [maxUses] [gold] [exp]`\n" +
            'Ví dụ: `code create WELCOME2025 "Chào mừng" "Mã chào mừng năm 2025" 100 1000 500`',
        };
      }

      const codeId = args[1];
      const codeName = args[2].replace(/"/g, "");
      const codeDesc = args[3].replace(/"/g, "");
      const maxUses = parseInt(args[4]) || -1;
      const gold = parseInt(args[5]) || 0;
      const exp = parseInt(args[6]) || 0;

      const result = await this.createCode({
        code: codeId,
        name: codeName,
        description: codeDesc,
        maxUses: maxUses,
        rewards: {
          gold: gold,
          exp: exp,
          items: [],
        },
      });

      return result;
    }

    // Xóa code (chỉ admin)
    if (action === "delete") {
      if (!player.isAdmin) {
        return {
          success: false,
          message: "❌ Bạn không có quyền sử dụng chức năng này!",
        };
      }

      if (args.length < 2) {
        return {
          success: false,
          message: "📝 Cú pháp: `code delete [id]`",
        };
      }

      const codeToDelete = await this.getCodeByCode(args[1]);
      if (!codeToDelete) {
        return {
          success: false,
          message: "❌ Không tìm thấy code!",
        };
      }

      const result = await this.deleteCode(codeToDelete.getId());
      return result;
    }

    // Sử dụng code
    const codeString = args[0];
    return await this.useCode(player, codeString);
  }

  /**
   * Sử dụng code
   * @param {Player} player - Đối tượng người chơi
   * @param {string} codeString - Mã code
   * @returns {Promise<Object>} - Kết quả sử dụng code
   */
  async useCode(player, codeString) {
    const codeRaw = String(codeString || "").trim();
    if (!codeRaw) {
      return { success: false, message: "❌ Vui lòng nhập mã code!" };
    }

    const code = await this.getCodeByCode(codeRaw);
    if (!code) {
      return { success: false, message: "❌ Không tìm thấy mã code này." };
    }

    const playerLevel = Number(player?.realm?.getLevel() || 1);
    const can = code.canUse(player.getGlobalId(), playerLevel);
    if (!can.canUse) {
      return { success: false, message: `❌ ${can.reason}` };
    }

    if (Array.isArray(player.redeemedCodes) && player.redeemedCodes.includes(code.code)) {
      return { success: false, message: "❌ Bạn đã sử dụng mã này trước đó." };
    }

    return { success: false, message: "❌ Tính năng đang được đóng băng." };

    // const rewards = code.use(player.getGlobalId());

    // // Ghi nhận đã sử dụng trên người chơi
    // if (!Array.isArray(player.redeemedCodes)) player.redeemedCodes = [];
    // player.redeemedCodes.push(code.code);
  }
}

let instance = null;

export function getCodeServiceInstance() {
  if (!instance) {
    instance = new CodeService();
  }
  return instance;
}
