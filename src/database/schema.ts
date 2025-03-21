export const SCHEMA = {
    users: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      chat_id INTEGER NOT NULL,
      timezone TEXT DEFAULT 'UTC',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    races: `
    CREATE TABLE IF NOT EXISTS races (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      race_id TEXT UNIQUE,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT,
      location TEXT,
      round INTEGER,
      season INTEGER,
      circuit_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    driver_standings: `
    CREATE TABLE IF NOT EXISTS driver_standings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      driver_name TEXT NOT NULL,
      points REAL NOT NULL,
      wins INTEGER NOT NULL,
      team TEXT NOT NULL,
      season INTEGER NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    constructor_standings: `
    CREATE TABLE IF NOT EXISTS constructor_standings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      constructor_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      team_name TEXT NOT NULL,
      points REAL NOT NULL,
      wins INTEGER NOT NULL,
      season INTEGER NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    reminders: `
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      chat_id INTEGER NOT NULL,
      event_id TEXT NOT NULL,
      remind_before INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `
}; 