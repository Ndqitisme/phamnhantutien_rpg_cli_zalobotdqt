/**
 * DatabaseService.js
 * Service xử lý tương tác với cơ sở dữ liệu MySQL
 */

import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import { readFilePromise } from "../../../../../utils/util.js";
import chalk from "chalk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class DatabaseService {
  constructor() {
    this.connection = null;
    this.config = null;
    this.isInitialized = false;
  }

  /**
   * Khởi tạo kết nối database
   */
  async initialize() {
    try {
      // Đọc config
      const configPath = path.join(__dirname, "../mysql/database-config.json");
      const configFile = await readFilePromise(configPath);
      this.config = JSON.parse(configFile);

      // Tạo kết nối tạm thời để tạo database
      const tempConnection = await mysql.createConnection({
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
      });

      // Tạo database nếu chưa tồn tại
      await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${this.config.database}\``);
      await tempConnection.end();

      // Tạo pool connection
      this.connection = mysql.createPool({
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        port: this.config.port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      // Kiểm tra kết nối
      await this.connection.execute("SELECT 1");
      
      this.isInitialized = true;
      console.log(chalk.green("✓ DatabaseService khởi tạo thành công"));
      
      return true;
    } catch (error) {
      console.error(chalk.red("✗ Lỗi khởi tạo DatabaseService:"), error);
      return false;
    }
  }

  /**
   * Lấy kết nối database
   */
  getConnection() {
    if (!this.isInitialized) {
      throw new Error("DatabaseService chưa được khởi tạo");
    }
    return this.connection;
  }

  /**
   * Thực thi query
   */
  async execute(query, params = []) {
    try {
      const [rows] = await this.connection.execute(query, params);
      return rows;
    } catch (error) {
      console.error(chalk.red("Lỗi thực thi query:"), error);
      throw error;
    }
  }

  /**
   * Thực thi query với transaction
   */
  async executeTransaction(queries) {
    const connection = await this.connection.getConnection();
    try {
      await connection.beginTransaction();
      
      const results = [];
      for (const query of queries) {
        const [rows] = await connection.execute(query.sql, query.params || []);
        results.push(rows);
      }
      
      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Đóng kết nối database
   */
  async close() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      this.isInitialized = false;
    }
  }
}

let instance = null;

export function getDatabaseServiceInstance() {
  if (!instance) {
    instance = new DatabaseService();
  }
  return instance;
}

export default {
  DatabaseService,
  getDatabaseServiceInstance
};
