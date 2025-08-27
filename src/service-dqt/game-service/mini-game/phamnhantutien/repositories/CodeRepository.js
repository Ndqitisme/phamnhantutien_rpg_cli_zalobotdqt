/**
 * CodeRepository.js
 * Repository xử lý tương tác với bảng codes trong database
 */

import { getDatabaseServiceInstance } from "../services/DatabaseService.js";
import { Code } from "../models/Code.js";

export class CodeRepository {
  constructor() {
    this.dbService = getDatabaseServiceInstance();
  }

  /**
   * Lấy tất cả codes
   */
  async getAllCodes() {
    try {
      const query = `
        SELECT * FROM codes 
        ORDER BY created_at DESC
      `;
      
      const rows = await this.dbService.execute(query);
      const codes = [];
      
      for (const row of rows) {
        const codeData = this._convertRowToCodeData(row);
        codes.push(new Code(codeData));
      }
      
      return codes;
    } catch (error) {
      console.error("Lỗi khi lấy tất cả codes:", error);
      return [];
    }
  }

  /**
   * Lấy code theo ID
   */
  async getCodeById(codeId) {
    try {
      const query = "SELECT * FROM codes WHERE code_id = ?";
      const rows = await this.dbService.execute(query, [codeId]);
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      const codeData = this._convertRowToCodeData(row);
      return new Code(codeData);
    } catch (error) {
      console.error("Lỗi khi lấy code theo ID:", error);
      return null;
    }
  }

  /**
   * Lấy code theo mã code
   */
  async getCodeByCode(codeString) {
    try {
      const query = "SELECT * FROM codes WHERE code = ?";
      const rows = await this.dbService.execute(query, [codeString]);
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      const codeData = this._convertRowToCodeData(row);
      return new Code(codeData);
    } catch (error) {
      console.error("Lỗi khi lấy code theo mã code:", error);
      return null;
    }
  }

  /**
   * Tạo code mới
   */
  async createCode(codeData) {
    try {
      const query = `
        INSERT INTO codes (
          code_id, name, description, code, rewards, max_uses, 
          current_uses, user_limit, expire_date, is_active, 
          required_level, used_users, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        codeData.id || `code_${Date.now()}`,
        codeData.name || codeData.id,
        codeData.description || '',
        codeData.code,
        JSON.stringify(codeData.rewards || { gold: 0, exp: 0, items: [] }),
        codeData.maxUses || 1,
        codeData.currentUses || 0,
        codeData.userLimit || 1,
        codeData.expireDate || null,
        codeData.isActive !== undefined ? codeData.isActive : 1,
        codeData.requiredLevel || 0,
        JSON.stringify(codeData.usedUsers || {}),
        codeData.createdAt || Date.now()
      ];
      
      await this.dbService.execute(query, params);
      return true;
    } catch (error) {
      console.error("Lỗi khi tạo code mới:", error);
      return false;
    }
  }

  /**
   * Cập nhật code
   */
  async updateCode(codeId, codeData) {
    try {
      const query = `
        UPDATE codes SET
          name = ?, description = ?, code = ?, rewards = ?, 
          max_uses = ?, current_uses = ?, user_limit = ?, 
          expire_date = ?, is_active = ?, required_level = ?, 
          used_users = ?
        WHERE code_id = ?
      `;
      
      const params = [
        codeData.name,
        codeData.description,
        codeData.code,
        JSON.stringify(codeData.rewards),
        codeData.maxUses,
        codeData.currentUses,
        codeData.userLimit,
        codeData.expireDate,
        codeData.isActive ? 1 : 0,
        codeData.requiredLevel,
        JSON.stringify(codeData.usedUsers),
        codeId
      ];
      
      await this.dbService.execute(query, params);
      return true;
    } catch (error) {
      console.error("Lỗi khi cập nhật code:", error);
      return false;
    }
  }

  /**
   * Xóa code
   */
  async deleteCode(codeId) {
    try {
      const query = "DELETE FROM codes WHERE code_id = ?";
      await this.dbService.execute(query, [codeId]);
      return true;
    } catch (error) {
      console.error("Lỗi khi xóa code:", error);
      return false;
    }
  }

  /**
   * Lấy danh sách codes khả dụng
   */
  async getAvailableCodes() {
    try {
      const currentTime = Date.now();
      const query = `
        SELECT * FROM codes 
        WHERE is_active = 1 
        AND (expire_date IS NULL OR expire_date > ?)
        ORDER BY created_at DESC
      `;
      
      const rows = await this.dbService.execute(query, [currentTime]);
      const codes = [];
      
      for (const row of rows) {
        const codeData = this._convertRowToCodeData(row);
        codes.push(new Code(codeData));
      }
      
      return codes;
    } catch (error) {
      console.error("Lỗi khi lấy codes khả dụng:", error);
      return [];
    }
  }

  /**
   * Cập nhật số lần sử dụng của code
   */
  async updateCodeUsage(codeId, userId) {
    try {
      // Lấy code hiện tại
      const code = await this.getCodeById(codeId);
      if (!code) return false;

      // Cập nhật số lần sử dụng
      code.currentUses += 1;
      
      // Cập nhật used_users
      if (!code.usedUsers[userId]) {
        code.usedUsers[userId] = 0;
      }
      code.usedUsers[userId] += 1;

      // Lưu vào database
      return await this.updateCode(codeId, code);
    } catch (error) {
      console.error("Lỗi khi cập nhật số lần sử dụng code:", error);
      return false;
    }
  }

  /**
   * Chuyển đổi dữ liệu từ database row sang code data
   */
  _convertRowToCodeData(row) {
    return {
      id: row.code_id,
      name: row.name,
      description: row.description,
      code: row.code,
      rewards: row.rewards ? JSON.parse(row.rewards) : { gold: 0, exp: 0, items: [] },
      maxUses: row.max_uses,
      currentUses: row.current_uses,
      userLimit: row.user_limit,
      expireDate: row.expire_date,
      isActive: Boolean(row.is_active),
      requiredLevel: row.required_level,
      usedUsers: row.used_users ? JSON.parse(row.used_users) : {},
      createdAt: row.created_at
    };
  }
}

let instance = null;

export function getCodeRepositoryInstance() {
  if (!instance) {
    instance = new CodeRepository();
  }
  return instance;
}

export default {
  CodeRepository,
  getCodeRepositoryInstance
};
