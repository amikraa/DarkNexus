import TelegramBot from "node-telegram-bot-api";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import type { InsertUser, InsertNews, InsertGateway } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";

let ADMIN_CHAT_IDS = process.env.ADMIN_CHAT_IDS?.split(",").map(Number) || [];
const ADMIN_IDS_FILE = path.join(process.cwd(), "admin_ids.json");

// Load admin IDs from file if it exists
try {
  if (fs.existsSync(ADMIN_IDS_FILE)) {
    const fileData = fs.readFileSync(ADMIN_IDS_FILE, 'utf8');
    const savedAdmins = JSON.parse(fileData);
    // Merge saved admins with environment admins, removing duplicates
    ADMIN_CHAT_IDS = [...new Set([...ADMIN_CHAT_IDS, ...savedAdmins])];
  }
} catch (error) {
  console.error("Error loading admin IDs:", error);
}

// Save admin IDs to file
const saveAdminIds = () => {
  try {
    fs.writeFileSync(ADMIN_IDS_FILE, JSON.stringify(ADMIN_CHAT_IDS), 'utf8');
  } catch (error) {
    console.error("Error saving admin IDs:", error);
  }
};

// Define owner IDs (original admins from environment variables)
const OWNER_CHAT_IDS = process.env.ADMIN_CHAT_IDS?.split(",").map(Number) || [];

const token = process.env.TELEGRAM_BOT_TOKEN || "";

export function startBot() {
  if (!token) {
    console.error("Telegram bot token not found!");
    return;
  }

  const bot = new TelegramBot(token, { polling: true });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    if (!ADMIN_CHAT_IDS.includes(chatId)) {
      bot.sendMessage(chatId, "Unauthorized. Contact the administrator.");
      return;
    }

    let commandsText = "Welcome to Nezuko Card Checker Admin Panel!\n\n" +
      "Commands:\n" +
      "/genkey - Generate new access key\n" +
      "/revoke <key> - Revoke access key\n" +
      "/addnews <title>|<content> - Add news\n" +
      "/addgateway <name>|<endpoint> - Add gateway\n" +
      "/togglegateway <id> - Toggle gateway status\n" +
      "/addcredits <key> <amount> - Add credits to user";

    // Add owner-only commands if the user is an owner
    if (OWNER_CHAT_IDS.includes(chatId)) {
      commandsText += "\n\n👑 Owner Commands:\n" +
        "/addadmin <chat_id> - Add new admin\n" +
        "/listadmins - List all admins";
    }

    bot.sendMessage(chatId, commandsText);
  });

  // Generate access key
  bot.onText(/\/genkey/, async (msg) => {
    const chatId = msg.chat.id;
    if (!ADMIN_CHAT_IDS.includes(chatId)) return;

    const accessKey = nanoid(10);
    await storage.createUser({
      accessKey,
      credits: 0,
      language: "en"
    });

    bot.sendMessage(chatId, `New access key generated: ${accessKey}`);
  });

  // Revoke access key
  bot.onText(/\/revoke (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!ADMIN_CHAT_IDS.includes(chatId)) return;
    if (!match) return;

    const key = match[1];
    const success = await storage.revokeAccessKey(key);

    bot.sendMessage(chatId, success 
      ? `Access key ${key} revoked successfully`
      : `Access key ${key} not found`
    );
  });

  // Add news
  bot.onText(/\/addnews (.+)\|(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!ADMIN_CHAT_IDS.includes(chatId)) return;
    if (!match) return;

    const [_, title, content] = match;
    await storage.addNews({
      title,
      content,
      createdAt: new Date().toISOString()
    });

    bot.sendMessage(chatId, "News added successfully");
  });

  // Add gateway
  bot.onText(/\/addgateway (.+)\|(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!ADMIN_CHAT_IDS.includes(chatId)) return;
    if (!match) return;

    const [_, name, endpoint] = match;
    await storage.addGateway({
      name,
      endpoint,
      active: true
    });

    bot.sendMessage(chatId, "Gateway added successfully");
  });

  // Toggle gateway
  bot.onText(/\/togglegateway (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!ADMIN_CHAT_IDS.includes(chatId)) return;
    if (!match) return;

    const id = parseInt(match[1]);
    const success = await storage.toggleGateway(id);

    bot.sendMessage(chatId, success 
      ? `Gateway ${id} status toggled successfully`
      : `Gateway ${id} not found`
    );
  });

  // Add credits
  bot.onText(/\/addcredits (.+) (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!ADMIN_CHAT_IDS.includes(chatId)) return;
    if (!match) return;

    const [_, key, amount] = match;
    const credits = parseInt(amount);

    const user = await storage.validateAccessKey(key);
    if (!user) {
      bot.sendMessage(chatId, "User not found");
      return;
    }

    await storage.updateUserCredits(user.id, user.credits + credits);
    bot.sendMessage(chatId, `Added ${credits} credits to user ${key}`);
  });

  // Add admin (owner only)
  bot.onText(/\/addadmin (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;

    // Check if the requester is an owner
    if (!OWNER_CHAT_IDS.includes(chatId)) {
      bot.sendMessage(chatId, "This command is available to owners only");
      return;
    }

    if (!match) return;

    const newAdminId = parseInt(match[1]);

    if (isNaN(newAdminId)) {
      bot.sendMessage(chatId, "Invalid chat ID format. Please provide a numeric ID");
      return;
    }

    if (ADMIN_CHAT_IDS.includes(newAdminId)) {
      bot.sendMessage(chatId, "This user is already an admin");
      return;
    }

    // Add the new admin
    ADMIN_CHAT_IDS.push(newAdminId);
    saveAdminIds();

    bot.sendMessage(chatId, `Admin added successfully! Chat ID: ${newAdminId}`);

    // Send welcome message to new admin
    try {
      await bot.sendMessage(
        newAdminId,
        "You have been added as an admin to the Nezuko Card Checker Admin Panel. Use /start to see available commands."
      );
    } catch (error) {
      bot.sendMessage(
        chatId,
        "Admin added, but failed to send welcome message. The bot may need to be started by the new admin first."
      );
    }
  });

  // List all admins (owner only)
  bot.onText(/\/listadmins/, async (msg) => {
    const chatId = msg.chat.id;

    // Check if the requester is an owner
    if (!OWNER_CHAT_IDS.includes(chatId)) {
      bot.sendMessage(chatId, "This command is available to owners only");
      return;
    }

    const ownerTag = (id: number) => OWNER_CHAT_IDS.includes(id) ? " 👑" : "";
    const adminList = ADMIN_CHAT_IDS.map(id => `- ${id}${ownerTag(id)}`).join("\n");
    bot.sendMessage(chatId, `Current admins:\n${adminList}\n\n👑 = Owner`);
  });

  console.log("Telegram bot started!");
}