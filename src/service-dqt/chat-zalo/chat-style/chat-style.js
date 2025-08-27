import chalk from "chalk";

export const COLOR_RED = "db342e";
export const COLOR_YELLOW = "f7b503";
export const COLOR_GREEN = "15a85f";
export const SIZE_18 = "18";
export const SIZE_16 = "14";
export const IS_BOLD = true;

export function getNameServer(api) {
  return "NDQ Server";
}

const splitText = `\n==================================================\n`;

export async function sendMessageQuery(api, message, caption, hasState = true) {
  try {
    const senderName = message.data.dName;
    const isGroup = true;
    const iconState = "\n❓❓❓";
    const nameServer = getNameServer();

    let msg =
      `${splitText}${isGroup ? senderName + "\n" : ""}${nameServer}` +
      `\n${caption}${hasState ? iconState : ""}${splitText}`;
    console.log(chalk.red(msg));
    return;
  } catch (error) {
    console.log(error);
  }
}

export async function sendMessageWarning(api, message, caption, hasState = true, ttl) {
  try {
    const senderName = message.data.dName;
    const isGroup = true;
    const iconState = "\n🚨🚨🚨";
    const nameServer = getNameServer();

    let msg =
      `${splitText}${isGroup ? senderName + "\n" : ""}${nameServer}` +
      `\n${caption}${hasState ? iconState : ""}${splitText}`;
    console.log(chalk.yellow(msg));
    return;
  } catch (error) {
    console.log(error);
  }
}

export async function sendMessageComplete(api, message, caption, hasState = true, ttl = 180000) {
  try {
    const senderName = message.data.dName;
    const isGroup = true;
    const iconState = "\n✅✅✅";
    const nameServer = getNameServer();

    let msg =
      `${splitText}${isGroup ? senderName + "\n" : ""}${nameServer}` +
      `\n${caption}${hasState ? iconState : ""}${splitText}`;
    console.log(chalk.green(msg));
    return;
  } catch (error) {
    console.log(error);
  }
}

export async function sendMessageFromSQL(api, message, result, hasState = true, ttl = 0) {
  try {
    const senderName = message.data.dName;
    const isGroup = true;
    const nameServer = getNameServer();

    let msg = `${splitText}${isGroup ? senderName + "\n" : ""}${nameServer}` + `\n${result.message}${splitText}`;
    if (hasState) {
      const state = result.success ? "✅✅✅" : "❌❌❌";
      msg += `\n${state}`;
    }
    if (result.success) {
      console.log(chalk.green(msg));
    } else {
      console.log(chalk.red(msg));
    }
    return;
  } catch (error) {
    console.log(error);
  }
}
