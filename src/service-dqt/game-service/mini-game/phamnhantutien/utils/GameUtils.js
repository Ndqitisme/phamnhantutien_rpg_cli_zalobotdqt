/**
 * GameUtils.js
 * Các hàm tiện ích dùng chung trong game
 */

/**
 * Tạo ID ngẫu nhiên
 * @param {number} length - Độ dài của ID
 * @returns {string} - ID ngẫu nhiên
 */
export function generateId(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Tạo số ngẫu nhiên trong khoảng
 * @param {number} min - Giá trị nhỏ nhất
 * @param {number} max - Giá trị lớn nhất
 * @returns {number} - Số ngẫu nhiên
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Tính xác suất
 * @param {number} chance - Xác suất (0-100)
 * @returns {boolean} - Kết quả
 */
export function rollChance(chance) {
  return Math.random() * 100 <= chance;
}

/**
 * Chọn một phần tử ngẫu nhiên từ mảng
 * @param {Array} array - Mảng cần chọn
 * @returns {*} - Phần tử được chọn
 */
export function randomElement(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Format số thành dạng rút gọn
 * @param {number} num - Số cần format
 * @returns {string} - Chuỗi đã format
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return "0";

  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/**
 * Lấy thời gian hiện tại dưới dạng chuỗi
 * @returns {string} - Chuỗi thời gian
 */
export function getCurrentTimeString() {
  const now = new Date();
  return now.toLocaleTimeString("vi-VN");
}

/**
 * Tạo chuỗi tiến độ
 * @param {number} current - Giá trị hiện tại
 * @param {number} max - Giá trị tối đa
 * @param {number} length - Độ dài của thanh tiến độ
 * @param {string} fillChar - Ký tự điền vào phần hoàn thành
 * @param {string} emptyChar - Ký tự điền vào phần chưa hoàn thành
 * @returns {string} - Chuỗi tiến độ
 */
export function createProgressBar(current, max, length = 10, fillChar = "■", emptyChar = "□") {
  if (max <= 0) max = 1;
  if (current > max) current = max;
  if (current < 0) current = 0;

  const progress = Math.floor((current / max) * length);
  let progressBar = "";

  for (let i = 0; i < length; i++) {
    progressBar += i < progress ? fillChar : emptyChar;
  }

  return progressBar;
}

/**
 * Format thời gian còn lại
 * @param {number} ms - Thời gian còn lại (ms)
 * @returns {string} - Chuỗi thời gian
 */
export function formatTimeLeft(ms) {
  if (ms <= 0) return "Đã hoàn thành";

  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Làm tròn số với số chữ số phần thập phân
 * @param {number} num - Số cần làm tròn
 * @param {number} decimal - Số chữ số phần thập phân
 * @returns {number} - Số đã làm tròn
 */
export function roundNumber(num, decimal = 2) {
  const factor = Math.pow(10, decimal);
  return Math.round(num * factor) / factor;
}

/**
 * Tính hiệu quả của chỉ số theo đường cong logarit
 * @param {number} stat - Giá trị chỉ số
 * @param {number} base - Hệ số cơ sở
 * @param {number} cap - Giới hạn trên
 * @returns {number} - Hiệu quả của chỉ số
 */
export function calculateStatEffectiveness(stat, base = 10, cap = 100) {
  if (stat <= 0) return 0;
  const effectiveness = (Math.log(stat + 1) / Math.log(base)) * cap;
  return Math.min(effectiveness, cap);
}

export default {
  generateId,
  randomInt,
  rollChance,
  randomElement,
  formatNumber,
  getCurrentTimeString,
  createProgressBar,
  formatTimeLeft,
  roundNumber,
  calculateStatEffectiveness,
};
