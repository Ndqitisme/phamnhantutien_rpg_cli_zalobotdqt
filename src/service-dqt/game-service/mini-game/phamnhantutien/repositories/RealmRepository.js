/**
 * RealmRepository.js
 * Repository xử lý tương tác với bảng realms và realm_substages trong database
 */

import { getDatabaseServiceInstance } from "../services/DatabaseService.js";

export class RealmRepository {
  constructor() {
    this.dbService = getDatabaseServiceInstance();
  }

  /**
   * Lấy tất cả realms
   */
  async getAllRealms() {
    try {
      const query = `
        SELECT r.*, 
               GROUP_CONCAT(
                 CONCAT(rs.tier, ':', rs.name, ':', rs.max_exp) 
                 ORDER BY rs.tier ASC 
                 SEPARATOR '|'
               ) as substages
        FROM realms r
        LEFT JOIN realm_substages rs ON r.realm_id = rs.realm_id
        GROUP BY r.id
        ORDER BY r.id ASC
      `;
      
      const rows = await this.dbService.execute(query);
      const realms = [];
      
      for (const row of rows) {
        const realm = this._convertRowToRealmData(row);
        realms.push(realm);
      }
      
      return realms;
    } catch (error) {
      console.error("Lỗi khi lấy tất cả realms:", error);
      return [];
    }
  }

  /**
   * Lấy realm theo ID
   */
  async getRealmById(realmId) {
    try {
      const query = `
        SELECT r.*, 
               GROUP_CONCAT(
                 CONCAT(rs.tier, ':', rs.name, ':', rs.max_exp) 
                 ORDER BY rs.tier ASC 
                 SEPARATOR '|'
               ) as substages
        FROM realms r
        LEFT JOIN realm_substages rs ON r.realm_id = rs.realm_id
        WHERE r.realm_id = ?
        GROUP BY r.id
      `;
      
      const rows = await this.dbService.execute(query, [realmId]);
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return this._convertRowToRealmData(row);
    } catch (error) {
      console.error("Lỗi khi lấy realm theo ID:", error);
      return null;
    }
  }

  /**
   * Lấy realm theo level
   */
  async getRealmByLevel(level) {
    try {
      // Tìm realm dựa trên level
      const query = `
        SELECT r.*, 
               GROUP_CONCAT(
                 CONCAT(rs.tier, ':', rs.name, ':', rs.max_exp) 
                 ORDER BY rs.tier ASC 
                 SEPARATOR '|'
               ) as substages
        FROM realms r
        LEFT JOIN realm_substages rs ON r.realm_id = rs.realm_id
        WHERE rs.max_exp >= ?
        GROUP BY r.id
        ORDER BY r.id ASC
        LIMIT 1
      `;
      
      const rows = await this.dbService.execute(query, [level]);
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return this._convertRowToRealmData(row);
    } catch (error) {
      console.error("Lỗi khi lấy realm theo level:", error);
      return null;
    }
  }

  /**
   * Lấy thông tin spirit root types
   */
  async getSpiritRootTypes() {
    try {
      const query = "SELECT * FROM spirit_root_types ORDER BY id ASC";
      const rows = await this.dbService.execute(query);
      
      const types = {};
      for (const row of rows) {
        types[row.type_id] = row.name;
      }
      
      return types;
    } catch (error) {
      console.error("Lỗi khi lấy spirit root types:", error);
      return {};
    }
  }

  /**
   * Lấy thông tin spirit root elements
   */
  async getSpiritRootElements() {
    try {
      const query = "SELECT * FROM spirit_root_elements ORDER BY id ASC";
      const rows = await this.dbService.execute(query);
      
      const elements = [];
      const elementsMap = {};
      
      for (const row of rows) {
        elements.push(row.element_id);
        elementsMap[row.element_id] = row.name;
      }
      
      return { elements, elementsMap };
    } catch (error) {
      console.error("Lỗi khi lấy spirit root elements:", error);
      return { elements: [], elementsMap: {} };
    }
  }

  /**
   * Lấy realm data để tương thích với code cũ
   */
  async getRealmsData() {
    try {
      const realms = await this.getAllRealms();
      const spiritRootTypes = await this.getSpiritRootTypes();
      const { elements, elementsMap } = await this.getSpiritRootElements();
      
      return {
        spirit_root_types: spiritRootTypes,
        spirit_root_elements: elements,
        spirit_root_elements_map: elementsMap,
        realms_data: realms
      };
    } catch (error) {
      console.error("Lỗi khi lấy realms data:", error);
      return {
        spirit_root_types: {},
        spirit_root_elements: [],
        spirit_root_elements_map: {},
        realms_data: []
      };
    }
  }

  /**
   * Chuyển đổi dữ liệu từ database row sang realm data
   */
  _convertRowToRealmData(row) {
    const substages = [];
    
    if (row.substages) {
      const substageStrings = row.substages.split('|');
      for (const substageString of substageStrings) {
        const [tier, name, maxExp] = substageString.split(':');
        substages.push({
          tier: parseInt(tier),
          name: name,
          maxExp: parseInt(maxExp)
        });
      }
    }
    
    return {
      id: row.realm_id,
      name: row.name,
      type: row.type,
      substages: substages,
      breakthroughAt: row.breakthrough_at
    };
  }
}

let instance = null;

export function getRealmRepositoryInstance() {
  if (!instance) {
    instance = new RealmRepository();
  }
  return instance;
}

export default {
  RealmRepository,
  getRealmRepositoryInstance
};
