import { Telegraf } from 'telegraf';
import { CommandHandlers } from './bot/commands';
import dotenv from 'dotenv';
import schedule from 'node-schedule';
import { ErgastService } from './services/ergast';
import { DatabaseService } from './database';
import { Logger } from './utils/logger';

// Load environment variables
dotenv.config();

if (!process.env.BOT_TOKEN) {
    Logger.error('BOT_TOKEN not provided in environment variables');
    process.exit(1);
}

const BOT_TOKEN: string = process.env.BOT_TOKEN;

async function main() {
    try {
        // Initialize bot
        const bot = new Telegraf(BOT_TOKEN);
        Logger.info('Telegram bot initialized');

        // Initialize command handlers
        const commandHandlers = await CommandHandlers.create();
        Logger.info('Command handlers initialized');

        // Register command handlers
        bot.command('start', (ctx) => commandHandlers.handleStart(ctx));
        bot.command('schedule', (ctx) => commandHandlers.handleSchedule(ctx));
        bot.command('driverstandings', (ctx) => commandHandlers.handleDriverStandings(ctx));
        bot.command('constructorstandings', (ctx) => commandHandlers.handleConstructorStandings(ctx));
        bot.command('settimezone', (ctx) => commandHandlers.handleSetTimezone(ctx));
        bot.command('results', (ctx) => commandHandlers.handleResults(ctx));
        bot.command('live', (ctx) => commandHandlers.handleLive(ctx));
        bot.command('pitstops', (ctx) => commandHandlers.handlePitStops(ctx));
        bot.command('driver', (ctx) => commandHandlers.handleDriverInfo(ctx));
        bot.command('apistatus', (ctx) => commandHandlers.handleApiStatus(ctx));
        bot.command('language', (ctx) => commandHandlers.handleLanguage(ctx));
        bot.command('language_en', (ctx) => commandHandlers.handleLanguageEn(ctx));
        bot.command('language_uk', (ctx) => commandHandlers.handleLanguageUk(ctx));

        Logger.info('Bot commands registered');

        // Update bot commands list
        await bot.telegram.setMyCommands([
            { command: 'start', description: 'Start the bot' },
            { command: 'schedule', description: 'View upcoming races' },
            { command: 'driverstandings', description: 'Current driver standings' },
            { command: 'constructorstandings', description: 'Current constructor standings' },
            { command: 'live', description: 'Get next race information' },
            { command: 'pitstops', description: 'View last race results' },
            { command: 'driver', description: 'Get driver info (use: /driver Hamilton)' },
            { command: 'results', description: 'Get last race results' },
            { command: 'settimezone', description: 'Set your timezone' },
            { command: 'apistatus', description: 'View or change data source' },
            { command: 'language', description: 'Language settings' },
            { command: 'language_en', description: 'Switch to English' },
            { command: 'language_uk', description: 'Switch to Ukrainian' }
        ]);

        // Schedule updates for race data
        const job = schedule.scheduleJob('0 */6 * * *', async () => {
            Logger.info('Starting scheduled data update');
            try {
                const db = await DatabaseService.getInstance();
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

                Logger.info('Scheduled data update completed successfully');
            } catch (error) {
                Logger.error('Error in scheduled data update', error);
            }
        });

        Logger.info('Scheduled job registered', {
            schedule: job.nextInvocation().toString()
        });

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