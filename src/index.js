import path from "path";
import readline from "readline";
import { handleGamePhamNhanTuTienCommand, handleGamePhamNhanTuTienMessage } from "./service-dqt/game-service/mini-game/phamnhantutien/index.js";

export const tempDir = path.join(process.cwd(), "assets");

const api = {
  getBotId: () => "NDQ _ Phàm Nhân Tu Tiên _ RPG _ CLI",
};

const message = {
  type: 1,
  data: {
    actionId: "11071143566170",
    msgId: "6947581932932",
    cliMsgId: "1756212773865",
    msgType: "webchat",
    uidFrom: "2625280118793095163",
    idTo: "5081064583773931542",
    dName: "N D Q",
    ts: "1756212773889",
    status: 1,
    content: "_pntt join",
    ttl: 0,
    cmd: 521,
    st: 3,
    at: 0,
  },
  threadId: "5081064583773931542",
  isSelf: false,
};

export function setContentJoinGame(content) {
  message.data.content = "!pntt " + content;
}

export function setContentPlayGame(content) {
  message.data.content = content;
}

const aliasCommand = "pntt";

/**
 * Tạo interface đọc input từ người dùng
 */
function createReadlineInterface() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '===== PNTT_RPG_CLI GameCodebyNDQ ===== \nPlease fill your command >>> '
  });

  return rl;
}

/**
 * Xử lý input từ người chơi
 * @param {string} input - Input từ người chơi
 * @param {Object} api - API object
 * @param {Object} message - Message object
 */
async function handlePlayerInput(input, api, message) {
  try {
    // Cập nhật nội dung tin nhắn với input từ người chơi
    setContentPlayGame(input.trim());
    
    // Gọi hàm xử lý tin nhắn game
    const result = await handleGamePhamNhanTuTienMessage(api, message);
    
    if (result) {
      console.log("✅ Xử lý tin nhắn thành công!");
    } else {
      console.log("❌ Xử lý tin nhắn thất bại hoặc không có lệnh như bạn đã nhập!");
    }
  } catch (error) {
    console.error("❌ Lỗi khi xử lý input:", error.message);
  }
}

/**
 * Khởi tạo chế độ tương tác với người chơi
 */
function startInteractiveMode() {
  const rl = createReadlineInterface();
  
  console.log("🎮 Chào mừng đến với Phàm Nhân Tu Tiên RPG CLI!");
  console.log("💡 Nhập lệnh để chơi game (gõ 'exit' để thoát)");
  console.log("📝 Các lệnh cơ bản: help, stats, code");
  console.log("");

  rl.prompt();

  rl.on('line', async (input) => {
    const trimmedInput = input.trim();
    
    if (trimmedInput.toLowerCase() === 'exit' || trimmedInput.toLowerCase() === 'quit') {
      console.log("👋 Tạm biệt! Hẹn gặp lại!");
      rl.close();
      process.exit(0);
    }
    
    if (trimmedInput === '') {
      rl.prompt();
      return;
    }

    // Xử lý input từ người chơi
    await handlePlayerInput(trimmedInput, api, message);
    
    // Hiển thị prompt tiếp theo
    rl.prompt();
  });

  rl.on('close', () => {
    console.log("👋 Đã đóng chế độ tương tác!");
    process.exit(0);
  });

  // Xử lý khi nhấn Ctrl+C
  process.on('SIGINT', () => {
    console.log("\n👋 Tạm biệt! Hẹn gặp lại!");
    rl.close();
    process.exit(0);
  });
}

async function main() {
  try {
    // Khởi tạo game ban đầu
    setContentJoinGame("join");
    await handleGamePhamNhanTuTienCommand(api, message, aliasCommand);
    
    console.log("");
    console.log("🚀 Game đã sẵn sàng! Bắt đầu chế độ tương tác...");
    console.log("");
    
    // Khởi động chế độ tương tác
    startInteractiveMode();
    
  } catch (error) {
    console.error("❌ Lỗi khởi tạo game:", error);
    process.exit(1);
  }
}

main();
