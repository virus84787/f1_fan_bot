import { Telegraf, Markup, session } from 'telegraf';
import { CommandHandlers } from './bot/commands';
import { Context } from 'telegraf';
import dotenv from 'dotenv';
import schedule from 'node-schedule';
import { ErgastService } from './services/ergast';
import { DatabaseService } from './database';
import { Logger } from './utils/logger';
import cron from 'node-cron';

// Load environment variables
dotenv.config();

if (!process.env.BOT_TOKEN) {
    Logger.error('BOT_TOKEN not provided in environment variables');
    process.exit(1);
}

const BOT_TOKEN: string = process.env.BOT_TOKEN;

// The session interface we're using in commands.ts
interface SessionData {
    selectedRace?: {
        id: string;
        name: string;
        date: string;
        time: string | undefined;
    };
}

// Add proper type definition
interface SessionContext extends Context {
    session: SessionData;
}

async function main() {
    try {
        // Initialize database
        const db = await DatabaseService.getInstance();
        Logger.info('Database initialized');

        // Log the database schema for debugging
        await db.logSchema();

        // Initialize bot
        const bot = new Telegraf(BOT_TOKEN);
        Logger.info('Telegram bot initialized');

        // Initialize command handlers
        const commandHandlers = await CommandHandlers.create(db);
        Logger.info('Command handlers initialized');

        // Enable session support
        bot.use(session());

        // Add logging middleware for debugging
        bot.use((ctx, next) => {
            if (ctx.message && 'text' in ctx.message) {
                Logger.debug('Received message text', {
                    text: ctx.message.text,
                    chatId: ctx.chat?.id,
                    userId: ctx.from?.id
                });
            }
            return next();
        });

        // Register command handlers
        bot.command('start', (ctx) => commandHandlers.handleStart(ctx));
        bot.command('menu', (ctx) => commandHandlers.handleMenu(ctx));
        bot.command('schedule', (ctx) => commandHandlers.handleSchedule(ctx));
        bot.command('driverstandings', (ctx) => commandHandlers.handleDriverStandings(ctx));
        bot.command('constructorstandings', (ctx) => commandHandlers.handleConstructorStandings(ctx));
        bot.command('settimezone', (ctx) => commandHandlers.handleSetTimezone(ctx));
        bot.command('results', (ctx) => commandHandlers.handleResults(ctx));
        bot.command('live', (ctx) => commandHandlers.handleLive(ctx));
        bot.command('pitstops', (ctx) => commandHandlers.handlePitStops(ctx));
        bot.command('driver', (ctx) => commandHandlers.handleDriverInfo(ctx));
        bot.command('language', (ctx) => commandHandlers.handleLanguage(ctx));
        bot.command('language_en', (ctx) => commandHandlers.handleLanguageEn(ctx));
        bot.command('language_uk', (ctx) => commandHandlers.handleLanguageUk(ctx));
        bot.command('remind', (ctx) => commandHandlers.handleRemindersMenu(ctx));

        // Handle message-based keyboard buttons
        bot.hears('❌ Exit', (ctx) => commandHandlers.handleExit(ctx));
        bot.hears('❌ Вихід', (ctx) => commandHandlers.handleExit(ctx));

        bot.hears('🏁 Schedule', (ctx) => commandHandlers.handleScheduleMenu(ctx));
        bot.hears('🏁 Розклад', (ctx) => commandHandlers.handleScheduleMenu(ctx));

        // Schedule submenu options
        bot.hears('🗓 View Schedule', (ctx) => commandHandlers.handleSchedule(ctx));
        bot.hears('🗓 Переглянути розклад', (ctx) => commandHandlers.handleSchedule(ctx));

        bot.hears('⏱️ Live', (ctx) => commandHandlers.handleLive(ctx));
        bot.hears('⏱️ Наживо', (ctx) => commandHandlers.handleLive(ctx));

        bot.hears('🏆 Driver Standings', (ctx) => commandHandlers.handleDriverStandings(ctx));
        bot.hears('🏆 Залік пілотів', (ctx) => commandHandlers.handleDriverStandings(ctx));

        bot.hears('🛠️ Constructor Standings', (ctx) => commandHandlers.handleConstructorStandings(ctx));
        bot.hears('🛠️ Залік конструкторів', (ctx) => commandHandlers.handleConstructorStandings(ctx));

        // Results menu
        bot.hears('🏎️ Results', (ctx) => commandHandlers.handleResultsMenu(ctx));
        bot.hears('🏎️ Результати', (ctx) => commandHandlers.handleResultsMenu(ctx));

        // Results submenu options
        bot.hears('🏁 Race Results', (ctx) => commandHandlers.handleResults(ctx));
        bot.hears('🏁 Результати гонки', (ctx) => commandHandlers.handleResults(ctx));

        bot.hears('🛑 Pit Stops', (ctx) => commandHandlers.handlePitStops(ctx));
        bot.hears('🛑 Піт-стопи', (ctx) => commandHandlers.handlePitStops(ctx));

        bot.hears('⏰ Reminders', (ctx) => commandHandlers.handleRemindersMenu(ctx));
        bot.hears('⏰ Нагадування', (ctx) => commandHandlers.handleRemindersMenu(ctx));

        bot.hears('🌐 Language Settings', (ctx) => commandHandlers.handleLanguage(ctx));
        bot.hears('🌐 Налаштування мови', (ctx) => commandHandlers.handleLanguage(ctx));

        bot.hears('🇬🇧 English', (ctx) => commandHandlers.handleLanguageEn(ctx));
        bot.hears('🇬🇧 Англійська', (ctx) => commandHandlers.handleLanguageEn(ctx));

        bot.hears('🇺🇦 Ukrainian', (ctx) => commandHandlers.handleLanguageUk(ctx));
        bot.hears('🇺🇦 Українська', (ctx) => commandHandlers.handleLanguageUk(ctx));

        bot.hears('⬅️ Back to Main Menu', (ctx) => commandHandlers.handleStart(ctx));
        bot.hears('⬅️ Повернутися до головного меню', (ctx) => commandHandlers.handleStart(ctx));

        // Handle reminders button
        bot.hears('⏰ Reminders', ctx => {
            commandHandlers.handleRemindersMenu(ctx);
        });

        // Handle reminders submenu options
        bot.hears('➕ Add New Reminder', ctx => {
            commandHandlers.handleAddReminder(ctx);
        });
        bot.hears('➕ Додати нове нагадування', ctx => {
            commandHandlers.handleAddReminder(ctx);
        });

        bot.hears('📋 Manage Reminders', ctx => {
            commandHandlers.handleManageReminders(ctx);
        });
        bot.hears('📋 Керувати нагадуваннями', ctx => {
            commandHandlers.handleManageReminders(ctx);
        });

        // Handle back to reminders menu button with multiple variations
        bot.hears('⬅️ Back to Reminders Menu', ctx => {
            commandHandlers.handleRemindersMenu(ctx);
        });
        bot.hears('⬅️ Повернутися до меню нагадувань', ctx => {
            commandHandlers.handleRemindersMenu(ctx);
        });
        // Add variations without emoji in case there's formatting issues
        bot.hears('Back to Reminders Menu', ctx => {
            commandHandlers.handleRemindersMenu(ctx);
        });
        bot.hears('Повернутися до меню нагадувань', ctx => {
            commandHandlers.handleRemindersMenu(ctx);
        });

        // Add a regex handler to catch any variation of "Back to Reminders Menu"
        bot.hears(/.*[Bb]ack to [Rr]eminders [Mm]enu.*|.*Повернутися до меню нагадувань.*/i, ctx => {
            if ('text' in ctx.message) {
                Logger.debug('Matched back to reminders menu regex', { text: ctx.message.text });
            }
            commandHandlers.handleRemindersMenu(ctx);
        });

        // Handle reminder deletion buttons
        bot.hears(/^❌.+\(ID: \d+\)$/, ctx => {
            const text = ctx.message.text;
            commandHandlers.handleReminderDeletion(ctx, text);
        });

        // Handle buttons for reminder flow
        bot.hears(/🏁 .+ \(.*\)/, ctx => {
            const text = ctx.message.text;
            commandHandlers.handleRaceReminderSelection(ctx as any as SessionContext, text);
        });

        // Handle reminder time selection options
        bot.hears(/За 1 годину|За 3 години|За 1 день|1 hour before|3 hours before|1 day before/, ctx => {
            const text = ctx.message.text;
            commandHandlers.handleReminderTimeSelection(ctx, text);
        });

        // Handle standings button
        bot.hears('📊 Standings', ctx => {
            commandHandlers.handleStandingsMenu(ctx);
        });
        bot.hears('📊 Турнірні таблиці', ctx => {
            commandHandlers.handleStandingsMenu(ctx);
        });

        // Handle back to standings menu button
        bot.hears('⬅️ Back to Standings Menu', ctx => {
            commandHandlers.handleStandingsMenu(ctx);
        });
        bot.hears('⬅️ Повернутися до меню турнірних таблиць', ctx => {
            commandHandlers.handleStandingsMenu(ctx);
        });

        // Back to Schedule Menu
        bot.hears('⬅️ Back to Schedule Menu', ctx => {
            commandHandlers.handleScheduleMenu(ctx);
        });
        bot.hears('⬅️ Повернутися до меню розкладу', ctx => {
            commandHandlers.handleScheduleMenu(ctx);
        });

        // Back to Results Menu
        bot.hears('⬅️ Back to Results Menu', ctx => {
            commandHandlers.handleResultsMenu(ctx);
        });
        bot.hears('⬅️ Повернутися до меню результатів', ctx => {
            commandHandlers.handleResultsMenu(ctx);
        });

        Logger.info('Bot commands and message handlers registered');

        // Update bot commands list
        await bot.telegram.setMyCommands([
            { command: 'start', description: 'Start the bot' },
            { command: 'menu', description: 'Open the main menu' },
            { command: 'schedule', description: 'View upcoming races' },
            { command: 'driverstandings', description: 'Current driver standings' },
            { command: 'constructorstandings', description: 'Current constructor standings' },
            { command: 'live', description: 'Get next race information' },
            { command: 'pitstops', description: 'View last race results' },
            { command: 'driver', description: 'Get driver info (use: /driver Hamilton)' },
            { command: 'results', description: 'Get last race results' },
            { command: 'settimezone', description: 'Set your timezone' },
            { command: 'language', description: 'Language settings' },
            { command: 'remind', description: 'Set a race reminder' }
        ]);

        // Schedule updates for race data
        const job = cron.schedule('0 */6 * * *', async () => {
            Logger.info('Starting scheduled data update');
            try {
                const races = await ErgastService.getCurrentSchedule();
                Logger.info('Retrieved race schedule for update', { raceCount: races.length });

                // Update races in database
                for (const race of races) {
                    await db.run(
                        `INSERT OR REPLACE INTO races 
                        (race_id, name, date, time, location, round, season, circuit_id) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            `${race.season}_${race.round}`,
                            race.raceName,
                            race.date,
                            race.time || null,
                            `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
                            parseInt(race.round),
                            parseInt(race.season),
                            race.Circuit.circuitId
                        ]
                    );
                }
                Logger.info('Race data updated successfully');

                // Update standings
                const driverStandings = await ErgastService.getDriverStandings();
                const constructorStandings = await ErgastService.getConstructorStandings();
                Logger.info('Retrieved standings for update', {
                    driverCount: driverStandings.length,
                    constructorCount: constructorStandings.length
                });

                // Clear existing standings
                await db.run('DELETE FROM driver_standings WHERE season = ?', [2025]);
                await db.run('DELETE FROM constructor_standings WHERE season = ?', [2025]);
                Logger.info('Cleared existing standings');

                // Insert new driver standings
                for (const standing of driverStandings) {
                    await db.run(
                        `INSERT INTO driver_standings 
                        (driver_id, position, driver_name, points, wins, team, season) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            standing.Driver.driverId,
                            parseInt(standing.position),
                            `${standing.Driver.givenName} ${standing.Driver.familyName}`,
                            parseFloat(standing.points),
                            parseInt(standing.wins),
                            standing.Constructors[0].name,
                            2025
                        ]
                    );
                }
                Logger.info('Driver standings updated successfully');

                // Insert new constructor standings
                for (const standing of constructorStandings) {
                    await db.run(
                        `INSERT INTO constructor_standings 
                        (constructor_id, position, team_name, points, wins, season) 
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            standing.Constructor.constructorId,
                            parseInt(standing.position),
                            standing.Constructor.name,
                            parseFloat(standing.points),
                            parseInt(standing.wins),
                            2025
                        ]
                    );
                }
                Logger.info('Constructor standings updated successfully');

                // Also check for reminders
                await CommandHandlers.sendReminderNotifications(db, bot);

            } catch (error) {
                Logger.error('Error in scheduled data update', error);
            }
        });

        Logger.info('Scheduled job registered', {
            schedule: '0 */6 * * *' // The cron expression
        });

        // Set up periodic check for reminders every minute
        setInterval(() => {
            CommandHandlers.sendReminderNotifications(db, bot);
        }, 60000); // check every minute

        // Start bot
        await bot.launch();
        Logger.info('Bot started successfully');

        // Enable graceful stop
        process.once('SIGINT', () => {
            Logger.info('Received SIGINT signal');
            bot.stop('SIGINT');
        });
        process.once('SIGTERM', () => {
            Logger.info('Received SIGTERM signal');
            bot.stop('SIGTERM');
        });

        Logger.info('F1 Fan Bot is running!');
    } catch (error) {
        Logger.error('Fatal error in main function', error);
        process.exit(1);
    }
}

main().catch((error) => {
    Logger.error('Unhandled error in main function', error);
    process.exit(1);
}); 