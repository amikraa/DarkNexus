import { pgTable, text, serial, integer, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  accessKey: text("access_key").notNull().unique(),
  credits: integer("credits").notNull().default(0),
  proxyHost: text("proxy_host"),
  proxyPort: text("proxy_port"),
  proxyUser: text("proxy_user"),
  proxyPass: text("proxy_pass"),
  language: text("language").notNull().default("en"),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

export const gateways = pgTable("gateways", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  endpoint: text("endpoint").notNull(),
  active: boolean("active").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(users);
export const insertNewsSchema = createInsertSchema(news);
export const insertGatewaySchema = createInsertSchema(gateways);

export type User = typeof users.$inferSelect;
export type News = typeof news.$inferSelect;
export type Gateway = typeof gateways.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type InsertGateway = z.infer<typeof insertGatewaySchema>;

export type CardCheckResponse = {
  emoji: string;
  status: "APPROVED" | "DECLINED";
  msg: string;
};
