import fs from "fs";

/**
 * Bất đồng bộ: Mở file với promise
 */
export async function readFilePromise(path, options = null) {
    return await fs.promises.readFile(path, options);
  }
  
  /**
   * Đồng bộ: Mở file với sync
   */
  export function readFileSync(path, options = null) {
    return fs.readFileSync(path, options);
  }
  
  /**
   * Bất đồng bộ: Lưu file vào thư mục cụ thể
   */
  export function writeFile(path, data) {
    fs.writeFile(path, data, (err) => {
      if (err) {
        console.error("Lỗi khi lưu file", err);
      }
      console.log("Ghi file xong!");
    });
    return path;
  }
  
  /**
   * Bất đồng bộ: Lưu file vào thư mục cụ thể
   */
  export async function writeFilePromise(path, data, options = null) {
    await fs.promises.writeFile(path, data, options);
    return path;
  }
  
  /**
   * Đồng bộ: Lưu file vào thư mục cụ thể
   */
  export function writeFileSync(path, data, options = null) {
    fs.writeFileSync(path, data, options);
    return path;
  }