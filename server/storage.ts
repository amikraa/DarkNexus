import { db } from "./lib/database";
import { type User, type News, type Gateway, type InsertUser, type InsertNews, type InsertGateway } from "@shared/schema";

export interface IStorage {
  validateAccessKey(key: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  updateUserCredits(id: number, credits: number): Promise<void>;
  updateUserProxy(id: number, proxy: Partial<User>): Promise<void>;
  updateUserLanguage(id: number, language: string): Promise<void>;
  getNews(): Promise<News[]>;
  addNews(news: InsertNews): Promise<News>;
  getGateways(): Promise<Gateway[]>;
  getGateway(id: number): Promise<Gateway | undefined>;
  createUser(user: Partial<InsertUser>): Promise<User>;
  revokeAccessKey(key: string): Promise<boolean>;
  addGateway(gateway: InsertGateway): Promise<Gateway>;
  toggleGateway(id: number): Promise<boolean>;
}

export class SQLiteStorage implements IStorage {
  async validateAccessKey(key: string): Promise<User | undefined> {
    return db.prepare("SELECT * FROM users WHERE accessKey = ?").get(key) as User;
  }

  async getUser(id: number): Promise<User | undefined> {
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User;
  }

  async updateUserCredits(id: number, credits: number): Promise<void> {
    db.prepare("UPDATE users SET credits = ? WHERE id = ?").run(credits, id);
  }

  async updateUserProxy(id: number, proxy: Partial<User>): Promise<void> {
    db.prepare("UPDATE users SET proxyHost = ?, proxyPort = ?, proxyUser = ?, proxyPass = ? WHERE id = ?").run(
      proxy.proxyHost, proxy.proxyPort, proxy.proxyUser, proxy.proxyPass, id
    );
  }

  async updateUserLanguage(id: number, language: string): Promise<void> {
    db.prepare("UPDATE users SET language = ? WHERE id = ?").run(language, id);
  }

  async getNews(): Promise<News[]> {
    return db.prepare("SELECT * FROM news ORDER BY createdAt DESC").all() as News[];
  }

  async addNews(news: InsertNews): Promise<News> {
    const stmt = db.prepare("INSERT INTO news (title, content) VALUES (?, ?) RETURNING *");
    return stmt.get(news.title, news.content) as News;
  }

  async getGateways(): Promise<Gateway[]> {
    return db.prepare("SELECT * FROM gateways").all() as Gateway[];
  }

  async getGateway(id: number): Promise<Gateway | undefined> {
    return db.prepare("SELECT * FROM gateways WHERE id = ?").get(id) as Gateway;
  }

  async createUser(user: Partial<InsertUser>): Promise<User> {
    const stmt = db.prepare("INSERT INTO users (accessKey, credits, language) VALUES (?, ?, ?) RETURNING *");
    return stmt.get(user.accessKey, user.credits || 0, user.language || "en") as User;
  }

  async revokeAccessKey(key: string): Promise<boolean> {
    const result = db.prepare("DELETE FROM users WHERE accessKey = ?").run(key);
    return result.changes > 0;
  }

  async addGateway(gateway: InsertGateway): Promise<Gateway> {
    const stmt = db.prepare("INSERT INTO gateways (name, endpoint, active) VALUES (?, ?, ?) RETURNING *");
    return stmt.get(gateway.name, gateway.endpoint, gateway.active ?? true) as Gateway;
  }

  async toggleGateway(id: number): Promise<boolean> {
    const gateway = this.getGateway(id);
    if (!gateway) return false;

    const newStatus = !(gateway.active);
    db.prepare("UPDATE gateways SET active = ? WHERE id = ?").run(newStatus, id);
    return true;
  }
}

export const storage = new SQLiteStorage();
