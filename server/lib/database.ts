import Database from "better-sqlite3";

const db = new Database("database.sqlite");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    accessKey TEXT UNIQUE,
    credits INTEGER DEFAULT 0,
    language TEXT DEFAULT 'en',
    proxyHost TEXT,
    proxyPort TEXT,
    proxyUser TEXT,
    proxyPass TEXT
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gateways (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    endpoint TEXT,
    active BOOLEAN DEFAULT 1
  );
`);

export { db };
