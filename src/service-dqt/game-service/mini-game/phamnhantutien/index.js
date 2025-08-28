/**
 * index.js
 * Entry point cho game Phàm Nhân Tu Tiên RPG CLI ZALO BOT
 */
import chalk from "chalk";
import { initializeServices } from "./services/ServiceInitializer.js";

export const gameTypePhamNhanTuTien = "Phàm Nhân Tu Tiên";

// Khởi tạo tất cả services
const registry = initializeServices(gameTypePhamNhanTuTien);

/**
 * Lấy service từ registry
 * @param {string} serviceName - Tên của service
 * @returns {Object} - Service instance
 */
export function getService(serviceName) {
  return registry.getService(serviceName);
}

/**
 * Xử lý tin nhắn từ người chơi trong game Phẫm Nhân Tu Tiên
 * @param {Object} api - API đối tượng
 * @param {Object} message - Thông tin tin nhắn
 * @returns {Promise<boolean>} Kết quả xử lý tin nhắn
 */
export async function handleGamePhamNhanTuTienMessage(api, message) {
  /** @type {import('./services/GameService.js').GameService} */
  const gameService = getService("GameService");
  return await gameService.handleMessage(api, message);
}

/**
 * Xử lý lệnh từ người dùng
 * @param {Object} api - API object
 * @param {Object} message - Message object
 * @param {string} aliasCommand - Alias command
 * @param {Object} groupSettings - Group settings
 */
export async function handleGamePhamNhanTuTienCommand(api, message, aliasCommand) {
  /** @type {import('./services/GameService.js').GameService} */
  const gameService = getService("GameService");
  await gameService.handlePhamNhanTuTienCommand(api, message, aliasCommand);
}

/**
 * Khởi tạo game Phẫm Nhân Tu Tiên
 */
await (async () => {
  console.log(chalk.yellow(`[${gameTypePhamNhanTuTien}] Đang khởi tạo game...`));

  try {
    /** @type {import('./services/GameService.js').GameService} */
    const gameService = getService("GameService");
    const success = await gameService.initialize();

    if (success) {
      console.log(chalk.greenBright(`[${gameTypePhamNhanTuTien}] Khởi tạo game thành công!`));
    } else {
      console.error(chalk.redBright(`[${gameTypePhamNhanTuTien}] Khởi tạo game thất bại!`));
    }
  } catch (error) {
    console.error(chalk.redBright(`[${gameTypePhamNhanTuTien}] Lỗi khi khởi tạo game:`, error));
  }
})();
