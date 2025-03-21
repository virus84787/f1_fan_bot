import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import { SCHEMA } from './schema';
import path from 'path';
import { promises as fs } from 'fs';

export class DatabaseService {
    private db: Database;
    private static instance: DatabaseService;

    private constructor(dbPath: string) {
        this.db = new sqlite3.Database(dbPath);
    }

    public static async getInstance(): Promise<DatabaseService> {
        if (!DatabaseService.instance) {
            const dbPath = process.env.DATABASE_PATH || './data/f1bot.db';
            const dbDir = path.dirname(dbPath);

            // Ensure the data directory exists
            await fs.mkdir(dbDir, { recursive: true });

            DatabaseService.instance = new DatabaseService(dbPath);
            await DatabaseService.instance.initializeTables();
            await DatabaseService.instance.runMigrations();
        }
        return DatabaseService.instance;
    }

    private async initializeTables(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                Object.values(SCHEMA).forEach(createTableSQL => {
                    this.db.run(createTableSQL, (err) => {
                        if (err) reject(err);
                    });
                });
                resolve();
            });
        });
    }

    private async runMigrations(): Promise<void> {
        try {
            // Check if the language column exists in the users table
            const tableInfo = await this.query<{ name: string }>(
                "PRAGMA table_info(users)"
            );
            
            const hasLanguageColumn = tableInfo.some(column => column.name === 'language');
            
            if (!hasLanguageColumn) {
                // Add the language column if it doesn't exist
                await this.run("ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'en'");
                console.log("Migration: Added 'language' column to users table");
            }
        } catch (error) {
            console.error("Error running migrations:", error);
        }
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
} 