import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';
import { promises as fs } from 'fs';
import { Logger } from '../utils/logger';

// Define default database path
const DEFAULT_DB_PATH = './data/f1bot.db';

// Define tables schema
const SCHEMA = {
    users: `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER NOT NULL UNIQUE,
            language TEXT DEFAULT 'en'
        )
    `,
    reminders: `
        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            chat_id INTEGER NOT NULL,
            event_id TEXT NOT NULL,
            remind_before INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `,
    races: `
        CREATE TABLE IF NOT EXISTS races (
            race_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT,
            location TEXT,
            round INTEGER,
            season INTEGER,
            circuit_id TEXT
        )
    `,
    driver_standings: `
        CREATE TABLE IF NOT EXISTS driver_standings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            driver_id TEXT NOT NULL,
            position INTEGER,
            driver_name TEXT,
            points REAL,
            wins INTEGER,
            team TEXT,
            season INTEGER
        )
    `,
    constructor_standings: `
        CREATE TABLE IF NOT EXISTS constructor_standings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            constructor_id TEXT NOT NULL,
            position INTEGER,
            team_name TEXT,
            points REAL,
            wins INTEGER,
            season INTEGER
        )
    `
};

export class DatabaseService {
    private db: Database;
    private static instance: DatabaseService;
    private dbPath: string;

    constructor(dbPath: string = DEFAULT_DB_PATH) {
        this.dbPath = dbPath;
        this.db = new sqlite3.Database(dbPath);
    }

    public static async getInstance(): Promise<DatabaseService> {
        if (!DatabaseService.instance) {
            Logger.info('Creating new database instance...');
            // Get the database path from environment variables or use default
            const dbPath = process.env.DATABASE_PATH || DEFAULT_DB_PATH;

            // Create data directory if it doesn't exist
            const dbDir = path.dirname(dbPath);
            await fs.mkdir(dbDir, { recursive: true });

            DatabaseService.instance = new DatabaseService(dbPath);

            // Initialize with schema creation
            await DatabaseService.instance.init();

            // Validate schema
            await DatabaseService.instance.validateAndFixSchema();

            Logger.info('Database instance ready');
        }
        return DatabaseService.instance;
    }

    public async init(): Promise<void> {
        try {
            Logger.info('Initializing database...');

            // Create tables if they don't exist
            for (const [table, sql] of Object.entries(SCHEMA)) {
                await this.run(sql);
                Logger.debug(`Created table if not exists: ${table}`);
            }

            Logger.info('Database initialized successfully');
        } catch (error) {
            Logger.error('Error initializing database', error);
            throw error;
        }
    }

    // Alias method for backward compatibility
    public async initializeTables(): Promise<void> {
        return this.init();
    }

    // Alias method for backward compatibility
    public async runMigrations(): Promise<void> {
        // Migrations are now handled by validateAndFixSchema
        return;
    }

    public async query<T>(sql: string, params: any[] = []): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows as T[]);
            });
        });
    }

    public async run(sql: string, params: any[] = []): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    public async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row as T);
            });
        });
    }

    public async logSchema(): Promise<void> {
        try {
            Logger.info('===== Database Schema Information =====');

            // Get list of all tables
            const tables = await this.query<{ name: string }>(
                "SELECT name FROM sqlite_master WHERE type='table'"
            );

            Logger.info(`Tables found: ${tables.map(t => t.name).join(', ')}`);

            // Log schema of each important table
            if (tables.some(t => t.name === 'users')) {
                const usersCols = await this.query<{ cid: number, name: string, type: string }>(
                    "PRAGMA table_info(users)"
                );
                Logger.info('Users table columns:', usersCols);
            } else {
                Logger.info('Users table not found');
            }

            if (tables.some(t => t.name === 'reminders')) {
                const remindersCols = await this.query<{ cid: number, name: string, type: string }>(
                    "PRAGMA table_info(reminders)"
                );
                Logger.info('Reminders table columns:', remindersCols);

                // Log sample data (first 5 rows)
                const sampleReminders = await this.query<{ id: number, user_id: number, chat_id: number, event_id: string, remind_before: number }>("SELECT * FROM reminders LIMIT 5");
                Logger.info('Sample reminders:', sampleReminders);
            } else {
                Logger.info('Reminders table not found');
            }

            Logger.info('===== End of Schema Information =====');
        } catch (error) {
            Logger.error('Error logging schema information', error);
        }
    }

    // Validate and fix database schema if needed
    private async validateAndFixSchema(): Promise<void> {
        try {
            Logger.info('Validating database schema...');

            // Check if reminders table has the correct columns
            const reminderTableInfo = await this.query<{ cid: number, name: string, type: string }>(
                "PRAGMA table_info(reminders)"
            );

            Logger.debug('Reminders table schema:', reminderTableInfo);

            // Check if users table has correct structure
            const userTableInfo = await this.query<{ cid: number, name: string, type: string }>(
                "PRAGMA table_info(users)"
            );

            Logger.debug('Users table schema:', userTableInfo);

            // Verify foreign key constraint exists
            const foreignKeys = await this.query<{ id: number, seq: number, table: string, name: string, foreign_table: string, foreign_column: string }>(
                "PRAGMA foreign_key_list(reminders)"
            );

            Logger.debug('Reminders foreign keys:', foreignKeys);

            // Enable foreign keys if not already enabled
            await this.run("PRAGMA foreign_keys = ON;");

            Logger.info('Database schema validation complete');
        } catch (error) {
            Logger.error('Error validating database schema', error);
        }
    }
} 