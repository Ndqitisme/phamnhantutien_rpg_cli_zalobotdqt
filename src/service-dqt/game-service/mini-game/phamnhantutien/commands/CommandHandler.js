/**
 * CommandHandler.js
 * Lớp xử lý các lệnh từ người chơi
 */

import { getGameDataInstance } from "../core/GameData.js";
import { getGameManagerInstance } from "../core/GameManager.js";
import { removeMention } from "../../../../../utils/format-util.js";
import { sendMessageComplete, sendMessageFromSQL } from "../../../../chat-zalo/chat-style/chat-style.js";
import { getGlobalPrefix } from "../../../../service.js";
import { getUserInfoBasic } from "../../../../info-service/user-info.js";
import { addGame, addPlayer, getActiveGames } from "../../index.js";
import { getServiceRegistry } from "../services/ServiceRegistry.js";

/**
 * Lớp xử lý các lệnh từ người chơi
 * @class CommandHandler
 */
export class CommandHandler {
  constructor() {
    /** @type {import('../core/GameData.js').GameData} */
    this.gameData = getGameDataInstance();
    /** @type {import('../core/GameManager.js').GameManager} */
    this.gameManager = getGameManagerInstance();
    this.gameManager.setCommandHandler(this);
    this._registry = getServiceRegistry();

    this.VALID_COMMANDS = ["help", "stats", "code"];
  }

  /**
   * Lấy một service từ registry
   * @param {string} serviceName - Tên service
   * @returns {Object} Service instance
   */
  getService = (serviceName) => this._registry.getService(serviceName);

  /**
   *@returns {import('../services/PlayerService.js').PlayerService}
   */
  get playerService() {
    return this.getService("PlayerService");
  }

  /**
   * @returns {import('../services/CodeService.js').CodeService}
   */
  get codeService() {
    return this.getService("CodeService");
  }

  /**
   * Hiển thị danh sách lệnh hỗ trợ
   * @param {Array} args - Tham số lệnh
   * @returns {Object} Kết quả xử lý
   */
  handleHelpCommand(args = []) {
    // Danh sách các loại lệnh
    const commandTypes = {
      general: {
        title: "📋 LỆNH CHUNG",
        commands: [
          { name: "help", desc: "Hiển thị danh sách lệnh" },
          { name: "stats", desc: "Xem tổng thể chi tiết nhân vật" },
          { name: "code [mã code]", desc: "Sử dụng mã code" },
        ],
      }
    };

    // Nếu có tham số, hiển thị trợ giúp cho loại lệnh cụ thể
    if (args.length > 0) {
      const category = args[0].toLowerCase();
      if (commandTypes[category]) {
        let helpText = `${commandTypes[category].title}\n\n`;
        for (const cmd of commandTypes[category].commands) {
          helpText += `• ${cmd.name}: ${cmd.desc}\n`;
        }

        return {
          success: true,
          message: helpText,
        };
      }
    }

    // Hiển thị tổng quan các loại lệnh
    let helpText = "🌟 DANH SÁCH LỆNH PHÀM NHÂN TU TIÊN 🌟\n\n";
    helpText += "Sử dụng `help [loại]` để xem chi tiết từng loại lệnh.\n\n";

    for (const category in commandTypes) {
      helpText += `${commandTypes[category].title} [${category}]:\n`;
      const maxCommands = Math.min(5, commandTypes[category].commands.length);
      for (let i = 0; i < maxCommands; i++) {
        const cmd = commandTypes[category].commands[i];
        helpText += `• ${cmd.name}: ${cmd.desc}\n`;
      }
      if (maxCommands < commandTypes[category].commands.length) {
        helpText += `... và ${commandTypes[category].commands.length - maxCommands} lệnh khác\n\n`;
      } else {
        helpText += "\n";
      }
    }

    helpText += "📖 Các loại trợ giúp khác:\n";
    helpText += "• help pills: Xem thông tin về các loại đan dược\n";

    return {
      success: true,
      message: helpText,
    };
  }

  /**
   * Gửi tin nhắn kết quả
   * @param {Object} api - API object
   * @param {Object} message - Message object
   * @param {Object} result - Result object with success and message properties
   */
  async sendMessageWithResult(api, message, result) {
    if (typeof result === "string") {
      result = {
        success: true,
        message: result,
      };
    }
    await sendMessageFromSQL(api, message, result, false, this.gameManager.TIME_TO_LIVE);
  }

  /**
   * Xử lý lệnh game từ người chơi
   * @param {Object} api - API object
   * @param {Object} message - Message object
   * @param {string} command - Lệnh được gửi
   * @param {Array} args - Các tham số của lệnh
   * @returns {Promise<Object>} - Kết quả xử lý lệnh
   */
  async handleGameCommand(api, message, command, args) {
    const playerId = message.data.uidFrom;

    const player = this.playerService.getPlayerInstance(playerId);

    if (!player) {
      return {
        success: false,
        message: "❌ Không tìm thấy thông tin người chơi!",
      };
    }

    player.lastActivity = Date.now();
    player.save();

    if (player.status === "dead") {
      const respawnStatus = this.playerService.checkRespawnStatus(player);
      if (respawnStatus.canRespawn) {
        return { success: true, message: respawnStatus.message };
      } else {
        return { success: true, message: respawnStatus.message };
      }
    }

    switch (command.toLowerCase()) {
      case "help":
        return this.handleHelpCommand(args);

      case "stats":
        return this.playerService.handleStatsCommand(player);

      case "code":
        return await this.codeService.handleCode(player, args.join(" "));

      default:
        return {
          success: false,
          message: "❌ Lệnh không hợp lệ! Sử dụng `help` để xem danh sách lệnh.",
        };
    }
  }

  /**
   * Xử lý message từ người chơi
   * @param {Object} api - API object
   * @param {Object} message - Message object
   */
  async handleMessage(api, message) {
    const playerId = message.data.uidFrom;

    const globalState = this.gameManager.getGlobalState();

    if (!globalState.has(playerId)) return false;

    this.gameManager.setPlayerState(playerId);

    const content = removeMention(message);

    if (content.toLowerCase() === "leave") {
      const result = await this.handleLeaveGame(api, message);
      await this.sendMessageWithResult(api, message, result);
      return true;
    }

    const parts = content.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (!this.VALID_COMMANDS.includes(command)) {
      return false;
    }

    try {
      const result = await this.handleGameCommand(api, message, command, args);
      await this.sendMessageWithResult(api, message, result);
      return true;
    } catch (error) {
      console.error("Lỗi khi xử lý lệnh game:", error);
      await this.sendMessageWithResult(api, message, {
        success: false,
        message: "Đã xảy ra lỗi khi xử lý lệnh game!",
      });
      return false;
    }
  }

  /**
   * Xử lý lệnh tham gia game
   * @param {Object} api - API object
   * @param {Object} message - Message object
   */
  async handleJoinGame(api, message) {
    const threadId = message.threadId;
    const playerId = message.data.uidFrom;
    const zaloName = message.data.dName;
    let player = null;
    let isCreate = false;

    if (!this.gameManager.isPlayerInGame(playerId)) {
      const userData = await getUserInfoBasic(api, playerId);
      const globalId = userData.globalId;

      const rawPlayerData = this.gameData.getPlayerByGlobalId(globalId);

      if (!rawPlayerData) {
        player = this.playerService.createNewPlayer(userData);
        isCreate = true;
      } else {
        player = this.playerService.createPlayer(rawPlayerData);
        if (!player.knownIds.includes(playerId)) {
          player.knownIds.push(playerId);
          player.save();
        }
      }

      const complete = this.gameManager.addPlayerToGame({ playerId, globalId });

      if (!complete) {
        await sendMessageComplete(api, message, "❌ Đã xảy ra lỗi khi thêm người chơi vào game!", false);
        return;
      }
    } else {
      player = this.gameManager.getPlayerFromId(playerId);
    }

    addPlayer(threadId, this.gameManager.gameType, playerId, zaloName);

    let welcomeMsg = `• Nhân Vật: ${player.getName()}\n`;
    welcomeMsg += `• ${player.realm.getDisplayString()}\n\n`;
    welcomeMsg +=
      `🎮 Chào mừng đã ${isCreate ? "đến" : "trở lại"} với hệ thống game ${this.gameManager.gameType}!` +
      `\n\n• Nhập 'help' để xem danh sách lệnh và 'quest' để xem nhiệm vụ.`;

    await sendMessageComplete(api, message, welcomeMsg, false, this.gameManager.TIME_TO_LIVE);
  }

  /**
   * Xử lý lệnh rời game
   * @param {Object} api - API object
   * @param {Object} message - Message object
   */
  async handleLeaveGame(api, message) {
    const playerId = message.data.uidFrom;
    const threadId = message.threadId;

    if (!this.gameManager.isPlayerInGame(playerId)) {
      await sendMessageComplete(api, message, `❌ Bạn chưa tham gia game ${this.gameManager.gameType}!`);
      return;
    }

    this.gameManager.removePlayerFromGame({ playerId, threadId });

    await sendMessageComplete(api, message, `👋 Bạn đã rời khỏi game ${this.gameManager.gameType}. Hẹn gặp lại sau!`);
  }

  /**
   * Xử lý lệnh game phamnhantutien
   * @param {Object} api - API object
   * @param {Object} message - Message object
   * @param {string} aliasCommand - Lệnh alias
   */
  async handlePhamNhanTuTienCommand(api, message, aliasCommand) {
    const botId = api.getBotId();
    const prefix = getGlobalPrefix(botId);
    const content = removeMention(message);
    const command = content.replace(prefix, "").replace(aliasCommand, "").trim();
    const threadId = message.threadId;

    const activeGames = getActiveGames();
    if (!activeGames.has(threadId)) addGame(threadId, this.gameManager.gameType, this.gameManager.getGlobalState());
    let threadGames = activeGames.get(threadId);
    if (!threadGames.has(this.gameManager.gameType))
      addGame(threadId, this.gameManager.gameType, this.gameManager.getGlobalState());

    switch (command) {
      case "join":
        await this.handleJoinGame(api, message);
        break;
      case "leave":
        await this.handleLeaveGame(api, message);
        break;
      default:
        await sendMessageComplete(
          api,
          message,
          "📜 Phàm Nhân Tu Tiên 📜\n\n" +
            ` > Chào mừng đến với hệ thống game Tu Tiên Nhập Vai (RPG) Dòng Lệnh (CLI)\n` +
            `${aliasCommand} join: Tham gia game\n` +
            `${aliasCommand} leave: Rời khỏi game\n` +
            `Sau khi tham gia game, bạn có thể sử dụng các lệnh game trực tiếp.\n` +
            `Khi đó có thể gõ 'help' để xem danh sách lệnh trong game.`
        );
        break;
    }
  }
}

let instance = null;

export function getCommandHandlerInstance() {
  if (!instance) {
    instance = new CommandHandler();
  }
  return instance;
}
