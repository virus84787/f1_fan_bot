import { Context } from 'telegraf';
import { DatabaseService } from '../database';
import { ErgastService, DriverStanding, ConstructorStanding } from '../services/ergast';
import moment from 'moment-timezone';
import { Message } from 'telegraf/types';
import { Logger } from '../utils/logger';
import { getTranslation, isValidLanguage, LanguageCode, languageNames } from '../locale';
import { Markup } from 'telegraf';

// Extend the context type to include session
interface SessionData {
    selectedRace?: {
        id: string;
        name: string;
        date: string;
        time: string | undefined;
    };
}

interface SessionContext extends Context {
    session: SessionData;
}

// Define reminder time intervals in minutes
enum ReminderTime {
    OneHour = 60,
    ThreeHours = 180,
    OneDay = 1440
}

// Interface for reminder data
interface Reminder {
    id: number;
    user_id: number;
    chat_id: number;
    event_id: string;
    remind_before: number;
    created_at: string;
}

// Database interfaces for standings data
interface DriverStandingDB {
    position: number;
    driver_name: string;
    points: number;
    wins: number;
    team: string;
}

interface ConstructorStandingDB {
    position: number;
    team_name: string;
    points: number;
    wins: number;
}

export class CommandHandlers {
    private db: DatabaseService;
    private sessions: Map<number, SessionData> = new Map(); // Add sessions map

    private constructor(db: DatabaseService) {
        this.db = db;
    }

    public static async create(db?: DatabaseService): Promise<CommandHandlers> {
        const database = db || await DatabaseService.getInstance();
        Logger.info('CommandHandlers initialized');
        return new CommandHandlers(database);
    }

    // Helper method to acknowledge button callbacks
    private async acknowledgeCallback(ctx: Context): Promise<void> {
        try {
            if ('callback_query' in ctx.update) {
                await ctx.answerCbQuery();
            }
        } catch (error) {
            Logger.error('Error acknowledging callback', error);
        }
    }

    // Helper method to get user language preference
    private async getUserLanguage(chatId: number): Promise<LanguageCode> {
        try {
            const user = await this.db.get<{ language: string }>(
                'SELECT language FROM users WHERE chat_id = ?',
                [chatId]
            );
            return (user?.language as LanguageCode) || 'en';
        } catch (error) {
            Logger.error('Error getting user language', error, { chatId });
            return 'en';
        }
    }

    // Helper method to translate message with user's language preference
    private async translate(chatId: number, key: string, variables: Record<string, string | number> = {}): Promise<string> {
        const language = await this.getUserLanguage(chatId);
        return getTranslation(key, language, variables);
    }

    public async handleStart(ctx: Context): Promise<void> {
        Logger.command(ctx, 'start');
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        try {
            // No need to acknowledge callback for regular keyboard buttons

            await this.db.run(
                'INSERT OR IGNORE INTO users (id, chat_id) VALUES (?, ?)',
                [ctx.from?.id, chatId]
            );
            Logger.info('New user registered', { userId: ctx.from?.id, chatId });

            const welcomeMessage = await this.translate(chatId, 'welcome');

            // Create main menu keyboard buttons
            const mainMenuButtons = await this.getMainMenuKeyboard(chatId);

            await ctx.reply(welcomeMessage, mainMenuButtons);
        } catch (error) {
            Logger.error('Error in handleStart', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_general');
            await ctx.reply(errorMessage);
        }
    }

    // Update language command handler to use buttons
    public async handleLanguage(ctx: Context): Promise<void> {
        Logger.command(ctx, 'language');
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        try {
            // Ensure the user exists in the database
            await this.db.run(
                'INSERT OR IGNORE INTO users (id, chat_id) VALUES (?, ?)',
                [ctx.from?.id, chatId]
            );

            const currentLanguage = await this.getUserLanguage(chatId);

            // Display current language and options
            const languageName = languageNames[currentLanguage] || currentLanguage;
            const currentLangMessage = await this.translate(chatId, 'language_current', { language: languageName });
            const optionsMessage = await this.translate(chatId, 'language_options');

            // Create language selection keyboard
            const languageButtons = await this.getLanguageMenuKeyboard(chatId);

            await ctx.reply(`${currentLangMessage}\n\n${optionsMessage}`, languageButtons);
        } catch (error) {
            Logger.error('Error in handleLanguage', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_general');
            await ctx.reply(errorMessage);
        }
    }

    public async handleLanguageEn(ctx: Context): Promise<void> {
        Logger.command(ctx, 'language_en');
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        try {
            // Ensure the user exists in the database
            await this.db.run(
                'INSERT OR IGNORE INTO users (id, chat_id) VALUES (?, ?)',
                [ctx.from?.id, chatId]
            );

            const currentLanguage = await this.getUserLanguage(chatId);

            // Update to English
            await this.db.run(
                'UPDATE users SET language = ? WHERE chat_id = ?',
                ['en', chatId]
            );

            // Get confirmation message in English
            const confirmMessage = getTranslation('language_set', 'en');

            Logger.info('Language updated', {
                chatId,
                newLanguage: 'en',
                oldLanguage: currentLanguage
            });

            // Return to main menu keyboard
            const mainMenuButtons = await this.getMainMenuKeyboard(chatId);

            await ctx.reply(confirmMessage, mainMenuButtons);
        } catch (error) {
            Logger.error('Error in handleLanguageEn', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_general');
            await ctx.reply(errorMessage);
        }
    }

    public async handleLanguageUk(ctx: Context): Promise<void> {
        Logger.command(ctx, 'language_uk');
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        try {
            // Ensure the user exists in the database
            await this.db.run(
                'INSERT OR IGNORE INTO users (id, chat_id) VALUES (?, ?)',
                [ctx.from?.id, chatId]
            );

            const currentLanguage = await this.getUserLanguage(chatId);

            // Update to Ukrainian
            await this.db.run(
                'UPDATE users SET language = ? WHERE chat_id = ?',
                ['uk', chatId]
            );

            // Get confirmation message in Ukrainian
            const confirmMessage = getTranslation('language_set', 'uk');

            Logger.info('Language updated', {
                chatId,
                newLanguage: 'uk',
                oldLanguage: currentLanguage
            });

            // Return to main menu keyboard
            const mainMenuButtons = await this.getMainMenuKeyboard(chatId);

            await ctx.reply(confirmMessage, mainMenuButtons);
        } catch (error) {
            Logger.error('Error in handleLanguageUk', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_general');
            await ctx.reply(errorMessage);
        }
    }

    public async handleSchedule(ctx: Context): Promise<void> {
        Logger.command(ctx, 'schedule');
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        try {
            const currentYear = ErgastService.getCurrentYear();
            Logger.info(`Fetching schedule for ${currentYear}`);

            const races = await ErgastService.getCurrentSchedule();
            Logger.info('Retrieved race schedule', { raceCount: races.length, year: currentYear });

            // Log a sample race to debug
            if (races.length > 0) {
                Logger.debug('Sample race data for debugging:', {
                    race: races[0],
                    circuit: races[0].Circuit,
                    location: races[0].Circuit.Location
                });
            }

            const user = await this.db.get<{ timezone: string }>(
                'SELECT timezone FROM users WHERE chat_id = ?',
                [chatId]
            );
            Logger.info('Retrieved user timezone', {
                chatId,
                timezone: user?.timezone || 'UTC'
            });

            const timezone = user?.timezone || 'UTC';
            const now = moment().tz(timezone);

            // Split races into upcoming and past
            const upcomingRaces = races
                .filter(race => moment.tz(`${race.date} ${race.time || '00:00:00'}`, timezone).isAfter(now))
                .slice(0, 5);

            const pastRaces = races
                .filter(race => moment.tz(`${race.date} ${race.time || '00:00:00'}`, timezone).isBefore(now))
                .slice(-5)
                .reverse();

            // Get schedule title
            const titleMessage = await this.translate(chatId, 'schedule_title', { year: currentYear });
            let message = `${titleMessage}\n\n`;

            // Show upcoming races if available
            if (upcomingRaces.length > 0) {
                const upcomingMessage = await this.translate(chatId, 'upcoming_races');
                message += `${upcomingMessage}\n\n`;

                for (const race of upcomingRaces) {
                    const raceTime = moment.tz(`${race.date} ${race.time || '00:00:00'}`, timezone);

                    // Build race information
                    const roundMessage = await this.translate(chatId, 'race_round', {
                        round: race.round,
                        raceName: race.raceName
                    });
                    message += `${roundMessage}\n`;

                    // Location information
                    message += `📍 ${race.Circuit.Location.locality || 'Unknown'}, ${race.Circuit.Location.country || 'Unknown'}\n`;

                    // Circuit information
                    message += `🏎️ ${race.Circuit.circuitName || 'Unknown Circuit'}\n`;

                    // Time information
                    message += `⏰ ${raceTime.format('MMMM D, YYYY HH:mm')} ${timezone}\n`;

                    // Add session times if available
                    if (race.FirstPractice) {
                        const fp1Time = moment.tz(`${race.FirstPractice.date} ${race.FirstPractice.time}`, timezone);
                        message += `🔹 FP1: ${fp1Time.format('MMMM D, HH:mm')}\n`;
                    }
                    if (race.SecondPractice) {
                        const fp2Time = moment.tz(`${race.SecondPractice.date} ${race.SecondPractice.time}`, timezone);
                        message += `🔹 FP2: ${fp2Time.format('MMMM D, HH:mm')}\n`;
                    }
                    if (race.ThirdPractice) {
                        const fp3Time = moment.tz(`${race.ThirdPractice.date} ${race.ThirdPractice.time}`, timezone);
                        message += `🔹 FP3: ${fp3Time.format('MMMM D, HH:mm')}\n`;
                    }
                    if (race.Sprint) {
                        const sprintTime = moment.tz(`${race.Sprint.date} ${race.Sprint.time}`, timezone);
                        message += `🔹 Sprint: ${sprintTime.format('MMMM D, HH:mm')}\n`;
                    }
                    if (race.Qualifying) {
                        const qualiTime = moment.tz(`${race.Qualifying.date} ${race.Qualifying.time}`, timezone);
                        message += `🔹 Quali: ${qualiTime.format('MMMM D, HH:mm')}\n`;
                    }

                    message += '\n';
                }
            } else if (currentYear > new Date().getFullYear()) {
                const notReleasedMessage = await this.translate(chatId, 'schedule_not_released', {
                    year: currentYear
                });
                message += `${notReleasedMessage}\n\n`;
            } else {
                const noUpcomingMessage = await this.translate(chatId, 'no_upcoming_races');
                message += `${noUpcomingMessage}\n\n`;
            }

            // Show past races if there are any
            if (pastRaces.length > 0) {
                const pastRacesMessage = await this.translate(chatId, 'past_races');
                message += `${pastRacesMessage}\n\n`;

                for (const race of pastRaces) {
                    const raceTime = moment.tz(`${race.date} ${race.time || '00:00:00'}`, timezone);

                    const roundMessage = await this.translate(chatId, 'race_round', {
                        round: race.round,
                        raceName: race.raceName
                    });
                    message += `${roundMessage}\n`;

                    // Location information
                    message += `📍 ${race.Circuit.Location.locality || 'Unknown'}, ${race.Circuit.Location.country || 'Unknown'}\n`;

                    message += `📅 ${raceTime.format('MMMM D, YYYY')}\n\n`;
                }
            } else if (currentYear > new Date().getFullYear()) {
                // Don't add anything for future years with no past races
            } else {
                const noPastRacesMessage = await this.translate(chatId, 'no_past_races');
                message += `${noPastRacesMessage}\n`;
            }

            // If no races at all
            if (races.length === 0) {
                const noRacesMessage = await this.translate(chatId, 'no_races', {
                    year: currentYear
                });
                message = noRacesMessage;
            }

            // Return to main menu keyboard
            const mainMenuButtons = await this.getMainMenuKeyboard(chatId);

            await ctx.reply(message, mainMenuButtons);
            Logger.info('Sent schedule message', {
                chatId,
                upcomingRacesCount: upcomingRaces.length,
                pastRacesCount: pastRaces.length,
                totalRaces: races.length,
                year: currentYear
            });
        } catch (error) {
            Logger.error('Error in handleSchedule', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_schedule');
            await ctx.reply(errorMessage);
        }
    }

    // Handler for driver standings
    public async handleDriverStandings(ctx: Context): Promise<void> {
        Logger.command(ctx, 'driverstandings');
        const chatId = this.getChatIdFromContext(ctx);

        try {
            // Get driver standings
            const driverStandings = await this.db.query<DriverStandingDB>(`
                SELECT position, driver_name, points, wins, team 
                FROM driver_standings 
                ORDER BY position ASC
            `);

            if (!driverStandings || driverStandings.length === 0) {
                try {
                    // If no standings in database, try to fetch from API
                    const standings = await ErgastService.getDriverStandings();
                    if (!standings || standings.length === 0) {
                        const errorMessage = await this.translate(chatId, 'error_driver_standings');
                        await ctx.reply(errorMessage, await this.getStandingsMenuKeyboard(chatId));
                        return;
                    }

                    // Format the standings
                    let message = `🏆 ${await this.translate(chatId, 'driver_standings_title')}\n\n`;

                    for (const [index, standing] of standings.entries()) {
                        message += `${index + 1}. ${standing.Driver.givenName} ${standing.Driver.familyName} - ${standing.points} ${await this.translate(chatId, 'points')}\n`;
                        message += `   🏎️ ${standing.Constructors[0].name}\n\n`;
                    }

                    await ctx.reply(message, await this.getStandingsMenuKeyboard(chatId));
                    Logger.info('Displayed driver standings from API', { chatId });
                } catch (error) {
                    Logger.error('Error getting driver standings from API', error, { chatId });
                    const errorMessage = await this.translate(chatId, 'error_driver_standings');
                    await ctx.reply(errorMessage, await this.getStandingsMenuKeyboard(chatId));
                }
                return;
            }

            // Format the standings from database
            let message = `🏆 ${await this.translate(chatId, 'driver_standings_title')}\n\n`;

            for (const standing of driverStandings) {
                message += `${standing.position}. ${standing.driver_name} - ${standing.points} ${await this.translate(chatId, 'points')}\n`;
                message += `   🏎️ ${standing.team}\n\n`;
            }

            await ctx.reply(message, await this.getStandingsMenuKeyboard(chatId));
            Logger.info('Displayed driver standings from database', { chatId });
        } catch (error) {
            Logger.error('Error in handleDriverStandings', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_driver_standings');
            await ctx.reply(errorMessage, await this.getStandingsMenuKeyboard(chatId));
        }
    }

    // Handler for constructor standings
    public async handleConstructorStandings(ctx: Context): Promise<void> {
        Logger.command(ctx, 'constructorstandings');
        const chatId = this.getChatIdFromContext(ctx);

        try {
            // Get constructor standings
            const constructorStandings = await this.db.query<ConstructorStandingDB>(`
                SELECT position, team_name, points, wins 
                FROM constructor_standings 
                ORDER BY position ASC
            `);

            if (!constructorStandings || constructorStandings.length === 0) {
                try {
                    // If no standings in database, try to fetch from API
                    const standings = await ErgastService.getConstructorStandings();
                    if (!standings || standings.length === 0) {
                        const errorMessage = await this.translate(chatId, 'error_constructor_standings');
                        await ctx.reply(errorMessage, await this.getStandingsMenuKeyboard(chatId));
                        return;
                    }

                    // Format the standings
                    let message = `🛠️ ${await this.translate(chatId, 'constructor_standings_title')}\n\n`;

                    for (const [index, standing] of standings.entries()) {
                        message += `${index + 1}. ${standing.Constructor.name} - ${standing.points} ${await this.translate(chatId, 'points')}\n\n`;
                    }

                    await ctx.reply(message, await this.getStandingsMenuKeyboard(chatId));
                    Logger.info('Displayed constructor standings from API', { chatId });
                } catch (error) {
                    Logger.error('Error getting constructor standings from API', error, { chatId });
                    const errorMessage = await this.translate(chatId, 'error_constructor_standings');
                    await ctx.reply(errorMessage, await this.getStandingsMenuKeyboard(chatId));
                }
                return;
            }

            // Format the standings from database
            let message = `🛠️ ${await this.translate(chatId, 'constructor_standings_title')}\n\n`;

            for (const standing of constructorStandings) {
                message += `${standing.position}. ${standing.team_name} - ${standing.points} ${await this.translate(chatId, 'points')}\n\n`;
            }

            await ctx.reply(message, await this.getStandingsMenuKeyboard(chatId));
            Logger.info('Displayed constructor standings from database', { chatId });
        } catch (error) {
            Logger.error('Error in handleConstructorStandings', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_constructor_standings');
            await ctx.reply(errorMessage, await this.getStandingsMenuKeyboard(chatId));
        }
    }

    public async handleSetTimezone(ctx: Context): Promise<void> {
        Logger.command(ctx, 'settimezone');
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const message = ctx.message as Message.TextMessage | undefined;
        if (!message?.text) return;

        const timezone = message.text.split(' ')[1];
        if (!timezone || !moment.tz.zone(timezone)) {
            Logger.info('Invalid timezone provided', {
                chatId,
                attemptedTimezone: timezone
            });
            const invalidMessage = await this.translate(chatId, 'timezone_invalid');

            // Return to main menu keyboard
            const mainMenuButtons = await this.getMainMenuKeyboard(chatId);

            await ctx.reply(invalidMessage, mainMenuButtons);
            return;
        }

        try {
            await this.db.run(
                'UPDATE users SET timezone = ? WHERE chat_id = ?',
                [timezone, chatId]
            );
            Logger.info('Timezone updated', {
                chatId,
                newTimezone: timezone
            });

            const successMessage = await this.translate(chatId, 'timezone_updated', {
                timezone: timezone
            });

            // Return to main menu keyboard
            const mainMenuButtons = await this.getMainMenuKeyboard(chatId);

            await ctx.reply(successMessage, mainMenuButtons);
        } catch (error) {
            Logger.error('Error in handleSetTimezone', error, {
                chatId,
                attemptedTimezone: timezone
            });
            const errorMessage = await this.translate(chatId, 'error_timezone');
            await ctx.reply(errorMessage);
        }
    }

    public async handleResults(ctx: Context): Promise<void> {
        Logger.command(ctx, 'results');
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        try {
            // Get the latest race results
            const results = await ErgastService.getLastRaceResults();
            Logger.info('Retrieved latest race results', { chatId, count: results.Results.length });

            // Format the results message
            const headerMessage = await this.translate(chatId, 'results_header', {
                raceName: results.raceName,
                date: moment(results.date).format('YYYY-MM-DD')
            });
            let message = `${headerMessage}\n\n`;

            for (const result of results.Results.slice(0, 20)) { // Limit to top 20
                const formattedResult = await this.translate(chatId, 'result_entry', {
                    position: result.position,
                    name: `${result.Driver.givenName} ${result.Driver.familyName}`,
                    team: result.Constructor.name,
                    time: result.Time?.time || 'DNF'
                });
                message += `${formattedResult}\n`;
            }

            // Return to main menu keyboard
            const mainMenuButtons = await this.getMainMenuKeyboard(chatId);

            await ctx.reply(message, mainMenuButtons);
            Logger.info('Displayed race results', { chatId });
        } catch (error) {
            Logger.error('Error in handleResults', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_general');
            await ctx.reply(errorMessage);
        }
    }

    public async handleLive(ctx: Context): Promise<void> {
        Logger.command(ctx, 'live');
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        try {
            const currentYear = ErgastService.getCurrentYear();

            // Get the next race from Ergast
            const nextRace = await ErgastService.getNextRace();

            if (!nextRace) {
                const noUpcomingRaceMessage = await this.translate(chatId, 'no_upcoming_race');

                // Return to main menu keyboard
                const mainMenuButtons = await this.getMainMenuKeyboard(chatId);

                await ctx.reply(noUpcomingRaceMessage, mainMenuButtons);
                return;
            }

            // Get user timezone
            const user = await this.db.get<{ timezone: string }>(
                'SELECT timezone FROM users WHERE chat_id = ?',
                [chatId]
            );
            Logger.info('Retrieved user timezone', {
                chatId,
                timezone: user?.timezone || 'UTC'
            });

            const timezone = user?.timezone || 'UTC';
            const drivers = await ErgastService.getDriverStandings();

            // Build the message directly
            let message = `🏎️ Next Race: ${nextRace.raceName || 'Unknown Race'}\n`;
            message += `Round ${nextRace.round || '0'} of the ${currentYear} season\n`;
            message += `🏎️ Circuit: ${nextRace.Circuit.circuitName || 'Unknown Circuit'}\n`;
            message += `📍 Location: ${nextRace.Circuit.Location.locality || 'Unknown City'}, ${nextRace.Circuit.Location.country || 'Unknown Country'}\n`;

            // Add race date and time with user timezone
            const raceDate = moment.tz(`${nextRace.date}T${nextRace.time || '00:00:00Z'}`, timezone);
            message += `📅 Date: ${raceDate.format('MMMM D, YYYY HH:mm')} (${timezone})\n`;

            // Calculate countdown
            const now = moment().tz(timezone);
            const duration = moment.duration(raceDate.diff(now));
            const days = Math.floor(duration.asDays());
            const hours = duration.hours();
            const minutes = duration.minutes();

            message += `⏱️ Countdown: ${days} days, ${hours} hours, ${minutes} minutes\n\n`;

            // Add qualifying and practice sessions if available, using user timezone
            if (nextRace.Qualifying) {
                const qualiDate = moment.tz(`${nextRace.Qualifying.date}T${nextRace.Qualifying.time}`, timezone);
                message += `🕒 Qualifying: ${qualiDate.format('MMMM D, HH:mm')} (${timezone})\n`;
            }

            if (nextRace.FirstPractice) {
                const fp1Date = moment.tz(`${nextRace.FirstPractice.date}T${nextRace.FirstPractice.time}`, timezone);
                message += `🕒 Practice 1: ${fp1Date.format('MMMM D, HH:mm')} (${timezone})\n`;
            }

            if (nextRace.SecondPractice) {
                const fp2Date = moment.tz(`${nextRace.SecondPractice.date}T${nextRace.SecondPractice.time}`, timezone);
                message += `🕒 Practice 2: ${fp2Date.format('MMMM D, HH:mm')} (${timezone})\n`;
            }

            if (nextRace.ThirdPractice) {
                const fp3Date = moment.tz(`${nextRace.ThirdPractice.date}T${nextRace.ThirdPractice.time}`, timezone);
                message += `🕒 Practice 3: ${fp3Date.format('MMMM D, HH:mm')} (${timezone})\n`;
            }

            if (nextRace.Sprint) {
                const sprintDate = moment.tz(`${nextRace.Sprint.date}T${nextRace.Sprint.time}`, timezone);
                message += `🕒 Sprint: ${sprintDate.format('MMMM D, HH:mm')} (${timezone})\n`;
            }

            // Add top 3 drivers from standings
            if (drivers.length > 0) {
                message += "\n📊 Current Standings (Top 3):\n";
                drivers.slice(0, 3).forEach(driver => {
                    message += `${driver.position}. ${driver.Driver.givenName} ${driver.Driver.familyName} - ${driver.points} points\n`;
                });
            }

            // Return to main menu keyboard
            const mainMenuButtons = await this.getMainMenuKeyboard(chatId);

            await ctx.reply(message, mainMenuButtons);
            Logger.info('Sent live session information', { chatId, nextRace: nextRace.raceName });
        } catch (error) {
            Logger.error('Error in handleLive', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_live');
            await ctx.reply(errorMessage);
        }
    }

    public async handlePitStops(ctx: Context): Promise<void> {
        Logger.command(ctx, 'pitstops');
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        try {
            const currentYear = ErgastService.getCurrentYear();

            // Get the last race result instead
            const lastRace = await ErgastService.getLastRaceResults();

            if (!lastRace) {
                const noResultsMessage = await this.translate(chatId, 'no_results');

                // Return to main menu keyboard
                const mainMenuButtons = await this.getMainMenuKeyboard(chatId);

                await ctx.reply(noResultsMessage, mainMenuButtons);
                return;
            }

            // Get user timezone
            const user = await this.db.get<{ timezone: string }>(
                'SELECT timezone FROM users WHERE chat_id = ?',
                [chatId]
            );
            const timezone = user?.timezone || 'UTC';

            const raceDate = moment.tz(`${lastRace.date} ${lastRace.time || '00:00:00'}`, timezone);
            const titleMessage = await this.translate(chatId, 'pitstops_title', {
                raceName: lastRace.raceName,
                date: raceDate.format('MMMM D, YYYY'),
                timezone: timezone
            });

            let message = `${titleMessage}\n\n`;

            if (lastRace.Results && lastRace.Results.length > 0) {
                for (let i = 0; i < Math.min(lastRace.Results.length, 10); i++) {
                    const result = lastRace.Results[i];
                    const entryMessage = await this.translate(chatId, 'pitstops_entry', {
                        lap: i + 1, // Using index as lap for simplicity
                        firstName: result.Driver.givenName,
                        lastName: result.Driver.familyName,
                        duration: result.Time ? result.Time.time : 'DNF'
                    });
                    message += `${entryMessage}\n\n`;
                }
            } else {
                const noPitstopsMessage = await this.translate(chatId, 'no_pitstops');
                message += noPitstopsMessage;
            }

            // Return to main menu keyboard
            const mainMenuButtons = await this.getMainMenuKeyboard(chatId);

            await ctx.reply(message, mainMenuButtons);
            Logger.info('Sent race results', { chatId, raceName: lastRace.raceName });
        } catch (error) {
            Logger.error('Error in handlePitStops', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_pitstops');
            await ctx.reply(errorMessage);
        }
    }

    public async handleDriverInfo(ctx: Context): Promise<void> {
        Logger.command(ctx, 'driver');
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        try {
            const currentYear = ErgastService.getCurrentYear();
            const msgText = ctx.message as Message.TextMessage | undefined;
            if (!msgText?.text) return;

            // Extract driver name or number from command
            const driverQuery = msgText.text.split(' ').slice(1).join(' ').trim();

            if (!driverQuery) {
                const usageMessage = await this.translate(chatId, 'driver_info_usage');

                // Return to main menu keyboard
                const mainMenuButtons = await this.getMainMenuKeyboard(chatId);

                await ctx.reply(usageMessage, mainMenuButtons);
                return;
            }

            // Get all driver standings to search through
            const driverStandings = await ErgastService.getDriverStandings();

            // Find the driver by number or by name
            let foundDriver = null;

            if (!isNaN(parseInt(driverQuery))) {
                // Search by driver number if it's a number
                foundDriver = driverStandings.find(d =>
                    d.Driver.permanentNumber && d.Driver.permanentNumber === driverQuery
                );
            } else {
                // Search by name (case insensitive)
                const query = driverQuery.toLowerCase();
                foundDriver = driverStandings.find(d =>
                    d.Driver.familyName.toLowerCase().includes(query) ||
                    d.Driver.givenName.toLowerCase().includes(query) ||
                    `${d.Driver.givenName} ${d.Driver.familyName}`.toLowerCase().includes(query)
                );
            }

            if (!foundDriver) {
                const notFoundMessage = await this.translate(chatId, 'driver_info_not_found');

                // Return to main menu keyboard
                const mainMenuButtons = await this.getMainMenuKeyboard(chatId);

                await ctx.reply(notFoundMessage, mainMenuButtons);
                return;
            }

            const driver = foundDriver.Driver;
            const constructor = foundDriver.Constructors[0];

            const titleMessage = await this.translate(chatId, 'driver_info_title', {
                firstName: driver.givenName,
                lastName: driver.familyName
            });

            const teamMessage = await this.translate(chatId, 'driver_info_team', {
                team: constructor.name
            });

            let message = `${titleMessage}\n${teamMessage}\n`;

            // Add optional fields with null checks
            if (driver.permanentNumber) {
                const numberMessage = await this.translate(chatId, 'driver_info_number', {
                    number: driver.permanentNumber
                });
                message += `${numberMessage}\n`;
            }

            if (driver.nationality) {
                const nationalityMessage = await this.translate(chatId, 'driver_info_nationality', {
                    nationality: driver.nationality
                });
                message += `${nationalityMessage}\n`;
            }

            message += `📊 Position: ${foundDriver.position}\n`;
            message += `💯 Points: ${foundDriver.points}\n`;
            message += `🏆 Wins: ${foundDriver.wins}\n`;

            // Add Wikipedia link if available
            if (driver.url) {
                message += `\nℹ️ More info: ${driver.url}\n`;
            }

            // Return to main menu keyboard
            const mainMenuButtons = await this.getMainMenuKeyboard(chatId);

            await ctx.reply(message, mainMenuButtons);
            Logger.info('Sent driver info', {
                chatId,
                driverName: `${driver.givenName} ${driver.familyName}`,
                year: currentYear
            });
        } catch (error) {
            Logger.error('Error in handleDriverInfo', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_driver_info');
            await ctx.reply(errorMessage);
        }
    }

    // Create main menu keyboard buttons with proper translations
    private async getMainMenuKeyboard(chatId: number) {
        return Markup.keyboard([
            [
                await this.translate(chatId, 'btn_schedule'),
                await this.translate(chatId, 'btn_standings')
            ],
            [
                await this.translate(chatId, 'btn_results'),
                await this.translate(chatId, 'btn_reminders')
            ],
            [
                await this.translate(chatId, 'btn_language_settings')
            ],
            [
                await this.translate(chatId, 'btn_exit')
            ]
        ]).resize();
    }

    // Helper to get standings menu keyboard with translations
    private async getStandingsMenuKeyboard(chatId: number) {
        return Markup.keyboard([
            [
                await this.translate(chatId, 'btn_driver_standings'),
                await this.translate(chatId, 'btn_constructor_standings')
            ],
            [
                await this.translate(chatId, 'back_to_main_menu')
            ]
        ]).resize();
    }

    // New method to handle main standings menu
    public async handleStandingsMenu(ctx: Context): Promise<void> {
        Logger.command(ctx, 'standings_menu');
        const chatId = this.getChatIdFromContext(ctx);

        try {
            const titleMessage = await this.translate(chatId, 'standings_menu_title');

            await ctx.reply(titleMessage, await this.getStandingsMenuKeyboard(chatId));
            Logger.info('Displayed standings menu', { chatId });
        } catch (error) {
            Logger.error('Error displaying standings menu', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_general');
            await ctx.reply(errorMessage, await this.getMainMenuKeyboard(chatId));
        }
    }

    // New method to handle main reminders menu
    public async handleRemindersMenu(ctx: Context): Promise<void> {
        Logger.command(ctx, 'reminders_menu');
        const chatId = this.getChatIdFromContext(ctx);

        try {
            const titleMessage = await this.translate(chatId, 'reminder_menu_title');

            // Create keyboard with reminder options
            const keyboard = await this.getRemindersMenuKeyboard(chatId);

            await ctx.reply(titleMessage, keyboard);
            Logger.info('Displayed reminders menu', { chatId });
        } catch (error) {
            Logger.error('Error displaying reminders menu', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_reminder');
            await ctx.reply(errorMessage, await this.getMainMenuKeyboard(chatId));
        }
    }

    // Update the name of the old handle remind method
    public async handleAddReminder(ctx: Context): Promise<void> {
        Logger.command(ctx, 'add_reminder');
        const chatId = this.getChatIdFromContext(ctx);

        // Rest of the method remains the same as the old handleRemind method
        try {
            // Get user
            const user = await this.ensureUserExists(ctx);
            if (!user) return;

            // Get races schedule from API
            const races = await ErgastService.getCurrentSchedule();

            if (!races || races.length === 0) {
                const noRacesMessage = await this.translate(chatId, 'no_upcoming_race');
                await ctx.reply(noRacesMessage, await this.getMainMenuKeyboard(chatId));
                return;
            }

            // Get today's date
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Filter for upcoming races only
            const upcomingRaces = races.filter(race => {
                const raceDate = new Date(race.date);
                raceDate.setHours(0, 0, 0, 0);
                return raceDate >= today;
            });

            if (upcomingRaces.length === 0) {
                const noRacesMessage = await this.translate(chatId, 'no_upcoming_race');
                await ctx.reply(noRacesMessage, await this.getMainMenuKeyboard(chatId));
                return;
            }

            // Get reminders title and explanation messages
            const titleMessage = await this.translate(chatId, 'reminder_title');
            const explanationMessage = await this.translate(chatId, 'reminder_explanation');
            const backButtonText = await this.translate(chatId, 'back_to_reminders_menu');

            // Build the keyboard with race options
            const raceButtons = [];
            const maxButtons = Math.min(upcomingRaces.length, 10); // Limit to 10 races

            for (let i = 0; i < maxButtons; i++) {
                const race = upcomingRaces[i];
                const raceDate = new Date(race.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
                raceButtons.push([`🏁 ${race.raceName} (${raceDate})`]);
            }

            // Add back button
            raceButtons.push([backButtonText]);

            const reminderKeyboard = Markup.keyboard(raceButtons).resize();

            // Send the message with race options
            await ctx.reply(`${titleMessage}\n\n${explanationMessage}`, reminderKeyboard);
            Logger.info('Displayed reminder race options', {
                chatId,
                raceCount: maxButtons
            });
        } catch (error) {
            Logger.error('Error handling remind command', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_reminder');
            await ctx.reply(errorMessage, await this.getMainMenuKeyboard(chatId));
        }
    }

    // Helper method to get user ID from context
    private getUserIdFromContext(ctx: Context): number {
        if (!ctx.from?.id) {
            throw new Error('Could not get user ID from context');
        }
        return ctx.from.id;
    }

    // Helper method to get chat ID from context
    private getChatIdFromContext(ctx: Context): number {
        if (!ctx.chat?.id) {
            throw new Error('Could not get chat ID from context');
        }
        return ctx.chat.id;
    }

    // Define reminder options with their time values in minutes
    private REMINDER_OPTIONS: Record<string, number> = {
        'За 1 годину': ReminderTime.OneHour,
        '1 hour before': ReminderTime.OneHour,
        'За 3 години': ReminderTime.ThreeHours,
        '3 hours before': ReminderTime.ThreeHours,
        'За 1 день': ReminderTime.OneDay,
        '1 day before': ReminderTime.OneDay
    };

    // Update ensureUserExists to work with either context or explicit params
    private async ensureUserExists(input: Context | number, inputChatId?: number): Promise<{ id: number, chat_id: number } | null> {
        try {
            let userChatId: number;
            let telegramUserId: number;

            if (typeof input === 'number' && inputChatId !== undefined) {
                // Case where we're called with explicit IDs
                telegramUserId = input;
                userChatId = inputChatId;
            } else if (input instanceof Context) {
                // Case where we're called with a context
                const ctx = input as Context;
                const chatId = ctx.chat?.id;
                const userId = ctx.from?.id;

                if (!chatId || !userId) {
                    Logger.error('Missing user or chat ID in context', {
                        chatId,
                        userId
                    });
                    return null;
                }
                userChatId = chatId;
                telegramUserId = userId;
            } else {
                Logger.error('Invalid parameters to ensureUserExists');
                return null;
            }

            // Check if user exists by chat_id
            let user = await this.db.get<{ id: number, chat_id: number }>(
                'SELECT id, chat_id FROM users WHERE chat_id = ?',
                [userChatId]
            );

            // Create user if doesn't exist
            if (!user) {
                // Log the user creation attempt
                Logger.info('Creating new user', { chatId: userChatId, telegramUserId });

                // Insert with explicit id column for the primary key
                await this.db.run(
                    'INSERT INTO users (chat_id) VALUES (?)',
                    [userChatId]
                );

                // Get the newly created user
                user = await this.db.get<{ id: number, chat_id: number }>(
                    'SELECT id, chat_id FROM users WHERE chat_id = ?',
                    [userChatId]
                );

                if (!user) {
                    Logger.error('Failed to retrieve newly created user', { chatId: userChatId, telegramUserId });
                    return null;
                }

                Logger.info('New user created successfully', user);
            }

            return user;
        } catch (error) {
            const chatId = typeof inputChatId === 'number' ? inputChatId : (input instanceof Context ? input.chat?.id : undefined);
            const userId = typeof input === 'number' ? input : (input instanceof Context ? input.from?.id : undefined);

            Logger.error('Error ensuring user exists', error, { chatId, userId });
            return null;
        }
    }

    // Handle selection of a race for reminder
    public async handleRaceReminderSelection(ctx: Context, raceName: string): Promise<void> {
        const chatId = this.getChatIdFromContext(ctx);

        try {
            // Extract race name from the button text
            const raceNameOnly = raceName.replace(/🏁 /, '').split(' (')[0];
            Logger.debug('Race reminder selection', { chatId, raceName: raceNameOnly });

            // Find the race in the schedule
            const races = await ErgastService.getCurrentSchedule();
            const selectedRace = races.find(r => r.raceName === raceNameOnly);

            if (!selectedRace) {
                Logger.error('Selected race not found in schedule', { chatId, raceName: raceNameOnly });
                const errorMessage = await this.translate(chatId, 'error_general');
                await ctx.reply(errorMessage, await this.getMainMenuKeyboard(chatId));
                return;
            }

            // Get reminder time options from translation
            const optionsMessage = await this.translate(chatId, 'reminder_options');
            const oneHourText = await this.translate(chatId, 'reminder_1h');
            const threeHoursText = await this.translate(chatId, 'reminder_3h');
            const oneDayText = await this.translate(chatId, 'reminder_1d');
            const backButtonText = await this.translate(chatId, 'back_to_reminders_menu');

            // Create keyboard with reminder time options
            const reminderOptions = Markup.keyboard([
                [oneHourText, threeHoursText],
                [oneDayText],
                [backButtonText]
            ]).resize();

            // Store the selected race in session for use when time is selected
            const sessionData: SessionData = {
                selectedRace: {
                    id: `${selectedRace.season}_${selectedRace.round}`,
                    name: selectedRace.raceName,
                    date: selectedRace.date,
                    time: selectedRace.time
                }
            };

            // Save to our sessions map
            this.sessions.set(chatId, sessionData);

            if (sessionData.selectedRace) {
                Logger.debug('Stored race in session', {
                    chatId,
                    raceId: sessionData.selectedRace.id
                });
            }

            await ctx.reply(`${optionsMessage} - ${selectedRace.raceName}`, reminderOptions);
            Logger.info('Displayed reminder time options', {
                chatId,
                race: selectedRace.raceName
            });
        } catch (error) {
            Logger.error('Error handling race reminder selection', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_reminder');
            await ctx.reply(errorMessage, await this.getMainMenuKeyboard(chatId));
        }
    }

    // List all active reminders for a user
    private async listReminders(ctx: Context, userId: number, chatId: number): Promise<void> {
        try {
            // Get all reminders for this user
            const reminders = await this.db.query<Reminder>(
                `SELECT r.id, r.user_id, r.chat_id, r.event_id, r.remind_before, r.created_at
                FROM reminders r 
                WHERE r.user_id = ?`,
                [userId]
            );

            if (reminders.length === 0) {
                const noneMessage = await this.translate(chatId, 'reminder_none');

                await ctx.reply(noneMessage, await this.getMainMenuKeyboard(chatId));
                return;
            }

            // Get the title from translation
            const titleMessage = await this.translate(chatId, 'reminder_list_title');
            let message = `${titleMessage}\n\n`;

            // Get information about each race
            const races = await ErgastService.getCurrentSchedule();

            for (const reminder of reminders) {
                // Find the race information
                const race = races.find(r => `${r.season}_${r.round}` === reminder.event_id);

                if (!race) continue;

                // Determine the reminder time text
                let reminderTimeText = '';
                if (reminder.remind_before === ReminderTime.OneHour) {
                    reminderTimeText = await this.translate(chatId, 'reminder_time_1h');
                } else if (reminder.remind_before === ReminderTime.ThreeHours) {
                    reminderTimeText = await this.translate(chatId, 'reminder_time_3h');
                } else if (reminder.remind_before === ReminderTime.OneDay) {
                    reminderTimeText = await this.translate(chatId, 'reminder_time_1d');
                }

                // Format the entry
                const entryMessage = await this.translate(chatId, 'reminder_list_entry', {
                    race_name: race.raceName,
                    reminder_time: reminderTimeText
                });

                message += `${entryMessage} (ID: ${reminder.id})\n`;
            }

            message += `\nTo delete a reminder, use /remind delete [ID]`;

            await ctx.reply(message, await this.getMainMenuKeyboard(chatId));

        } catch (error) {
            Logger.error('Error listing reminders', error, { chatId, userId });
            const errorMessage = await this.translate(chatId, 'error_reminder');
            await ctx.reply(errorMessage);
        }
    }

    // Delete a specific reminder
    private async deleteReminder(ctx: Context, reminderId: number, userId: number, chatId: number): Promise<void> {
        try {
            Logger.info('Attempting to delete reminder', { reminderId, userId, chatId });

            // First check if the reminder exists
            const reminder = await this.db.get<Reminder>(
                'SELECT * FROM reminders WHERE id = ? AND user_id = ?',
                [reminderId, userId]
            );

            if (!reminder) {
                Logger.info('Reminder not found or does not belong to user', { reminderId, userId });
                const errorMessage = await this.translate(chatId, 'error_reminder');
                await ctx.reply(errorMessage, await this.getRemindersMenuKeyboard(chatId));
                return;
            }

            // Delete the reminder, ensuring it belongs to this user
            await this.db.run(
                'DELETE FROM reminders WHERE id = ? AND user_id = ?',
                [reminderId, userId]
            );

            Logger.info('Reminder deleted successfully', { reminderId, userId, chatId });

            const deleteMessage = await this.translate(chatId, 'reminder_delete');
            await ctx.reply(deleteMessage, await this.getRemindersMenuKeyboard(chatId));

        } catch (error) {
            Logger.error('Error deleting reminder', error, { chatId, userId, reminderId });
            const errorMessage = await this.translate(chatId, 'error_reminder');
            await ctx.reply(errorMessage, await this.getRemindersMenuKeyboard(chatId));
        }
    }

    // Static method to send reminder notifications
    public static async sendReminderNotifications(db: DatabaseService, bot: any): Promise<void> {
        try {
            // Get current time
            const now = moment();
            Logger.info('Checking for reminders', { currentTime: now.format() });

            // Get all current races
            const races = await ErgastService.getCurrentSchedule();
            if (!races || races.length === 0) {
                Logger.info('No races found in schedule');
                return;
            }

            // Get all active reminders
            const allReminders = await db.query<Reminder>(
                'SELECT * FROM reminders'
            );

            Logger.info('Found reminders in database', {
                reminderCount: allReminders.length
            });

            // For each race, check if we need to send reminders
            for (const race of races) {
                const raceId = `${race.season}_${race.round}`;
                const raceTime = moment(`${race.date} ${race.time || '00:00:00'}`);

                // Skip races that have already happened
                if (raceTime.isBefore(now)) continue;

                // Get all reminders for this race
                const reminders = await db.query<Reminder>(
                    'SELECT * FROM reminders WHERE event_id = ?',
                    [raceId]
                );

                if (reminders.length > 0) {
                    Logger.info('Found reminders for race', {
                        race: race.raceName,
                        raceId,
                        reminderCount: reminders.length,
                        raceTime: raceTime.format()
                    });
                }

                for (const reminder of reminders) {
                    try {
                        // Calculate when to send reminder
                        const reminderTime = moment(raceTime).subtract(reminder.remind_before, 'minutes');

                        // If it's time to send reminder (within 1 minute window)
                        const diffMinutes = reminderTime.diff(now, 'minutes');

                        Logger.debug('Checking reminder timing', {
                            raceId,
                            reminderId: reminder.id,
                            chatId: reminder.chat_id,
                            reminderTime: reminderTime.format(),
                            diffMinutes
                        });

                        if (diffMinutes >= 0 && diffMinutes < 1) {
                            Logger.info('Sending reminder notification', {
                                raceId,
                                reminderId: reminder.id,
                                chatId: reminder.chat_id
                            });

                            // Get user's language preference
                            const user = await db.get<{ language: string }>(
                                'SELECT language FROM users WHERE chat_id = ?',
                                [reminder.chat_id]
                            );

                            const language = (user?.language as LanguageCode) || 'en';

                            // Format time left
                            let timeLeftText = '';
                            if (reminder.remind_before === ReminderTime.OneHour) {
                                timeLeftText = getTranslation('reminder_time_1h', language);
                            } else if (reminder.remind_before === ReminderTime.ThreeHours) {
                                timeLeftText = getTranslation('reminder_time_3h', language);
                            } else if (reminder.remind_before === ReminderTime.OneDay) {
                                timeLeftText = getTranslation('reminder_time_1d', language);
                            }

                            // Create notification message
                            const message = getTranslation('reminder_notification', language, {
                                race_name: race.raceName,
                                time_left: timeLeftText,
                                location: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
                                race_time: raceTime.format('MMMM D, YYYY HH:mm')
                            });

                            // Send the notification
                            await bot.telegram.sendMessage(reminder.chat_id, message);

                            // Delete the reminder after sending
                            await db.run(
                                'DELETE FROM reminders WHERE id = ?',
                                [reminder.id]
                            );

                            Logger.info('Sent race reminder', {
                                chatId: reminder.chat_id,
                                race: race.raceName
                            });
                        }
                    } catch (reminderError) {
                        Logger.error('Error processing individual reminder', reminderError, {
                            reminderId: reminder.id,
                            chatId: reminder.chat_id
                        });
                        // Continue with other reminders
                    }
                }
            }
        } catch (error) {
            Logger.error('Error sending reminder notifications', error);
        }
    }

    // Add a public method to handle My Reminders button
    public async handleMyReminders(ctx: Context): Promise<void> {
        Logger.command(ctx, 'myreminders');
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        try {
            // Get user information
            const user = await this.ensureUserExists(ctx);
            if (!user) {
                const errorMessage = await this.translate(chatId, 'error_general');
                await ctx.reply(errorMessage, await this.getMainMenuKeyboard(chatId));
                return;
            }

            // Show the reminder management menu
            await this.showReminderManagementMenu(ctx, user.id, chatId);
        } catch (error) {
            Logger.error('Error in handleMyReminders', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_reminder');
            await ctx.reply(errorMessage, await this.getMainMenuKeyboard(chatId));
        }
    }

    // Add a method to show the reminder management menu
    private async showReminderManagementMenu(ctx: Context, userId: number, chatId: number): Promise<void> {
        try {
            // Get all reminders for this user
            const reminders = await this.db.query<Reminder>(
                `SELECT r.id, r.user_id, r.chat_id, r.event_id, r.remind_before
                FROM reminders r 
                WHERE r.user_id = ?`,
                [userId]
            );

            if (reminders.length === 0) {
                const noneMessage = await this.translate(chatId, 'reminder_none');
                await ctx.reply(noneMessage, await this.getRemindersMenuKeyboard(chatId));
                return;
            }

            // Get the title from translation
            const titleMessage = await this.translate(chatId, 'reminder_list_title');
            let message = `${titleMessage}\n\n`;

            // Get information about each race
            const races = await ErgastService.getCurrentSchedule();

            // Build the message and keyboard buttons
            const reminderButtons = [];

            for (const reminder of reminders) {
                // Find the race information
                const race = races.find(r => `${r.season}_${r.round}` === reminder.event_id);
                if (!race) continue;

                // Determine the reminder time text
                let reminderTimeText = '';
                if (reminder.remind_before === ReminderTime.OneHour) {
                    reminderTimeText = await this.translate(chatId, 'reminder_time_1h');
                } else if (reminder.remind_before === ReminderTime.ThreeHours) {
                    reminderTimeText = await this.translate(chatId, 'reminder_time_3h');
                } else if (reminder.remind_before === ReminderTime.OneDay) {
                    reminderTimeText = await this.translate(chatId, 'reminder_time_1d');
                }

                // Format the entry
                const entryMessage = await this.translate(chatId, 'reminder_list_entry', {
                    race_name: race.raceName,
                    reminder_time: reminderTimeText
                });

                message += `${entryMessage} (ID: ${reminder.id})\n`;

                // Add a delete button for this reminder
                reminderButtons.push([`❌ ${race.raceName} - ${reminderTimeText} (ID: ${reminder.id})`]);
            }

            // Add back button
            const backButtonText = await this.translate(chatId, 'back_to_reminders_menu');
            reminderButtons.push([backButtonText]);

            // Create keyboard markup
            const markup = Markup.keyboard(reminderButtons).resize();

            message += `\n${await this.translate(chatId, 'reminder_delete_instruction')}`;

            await ctx.reply(message, markup);
            Logger.info('Displayed user reminders', { chatId, reminderCount: reminders.length });
        } catch (error) {
            Logger.error('Error showing reminder management menu', error, { chatId, userId });
            const errorMessage = await this.translate(chatId, 'error_reminder');
            await ctx.reply(errorMessage, await this.getRemindersMenuKeyboard(chatId));
        }
    }

    // Add a method to handle deletion from the menu
    public async handleReminderDeletion(ctx: Context, text: string): Promise<void> {
        const chatId = this.getChatIdFromContext(ctx);

        try {
            const user = await this.ensureUserExists(ctx);
            if (!user) return;

            // Extract the reminder ID from the button text
            const idMatch = text.match(/ID: (\d+)/);
            if (!idMatch || !idMatch[1]) {
                Logger.error('Could not extract reminder ID from button text', { text });
                const errorMessage = await this.translate(chatId, 'error_reminder');
                await ctx.reply(errorMessage, await this.getRemindersMenuKeyboard(chatId));
                return;
            }

            const reminderId = parseInt(idMatch[1]);
            await this.deleteReminder(ctx, reminderId, user.id, chatId);

            // Show the reminders list again after deletion
            await this.showReminderManagementMenu(ctx, user.id, chatId);
        } catch (error) {
            Logger.error('Error handling reminder deletion', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_reminder');
            await ctx.reply(errorMessage, await this.getRemindersMenuKeyboard(chatId));
        }
    }

    // Handle reminder time selection
    public async handleReminderTimeSelection(
        ctx: Context,
        selectedOption: string
    ): Promise<void> {
        try {
            const userId = this.getUserIdFromContext(ctx);
            const chatId = this.getChatIdFromContext(ctx);
            Logger.debug('handleReminderTimeSelection called', { userId, chatId, selectedOption });

            // Get the selected race from session context
            const sessionContext = this.sessions.get(chatId);
            if (!sessionContext || !sessionContext.selectedRace) {
                Logger.error('No selected race in session context', { chatId });
                const errorMessage = await this.translate(chatId, 'error_reminder');
                await ctx.reply(errorMessage, await this.getRemindersMenuKeyboard(chatId));
                return;
            }
            const selectedRace = sessionContext.selectedRace;
            Logger.debug('Found selected race', {
                race: selectedRace.name,
                raceId: selectedRace.id
            });

            // Get user
            let user;
            try {
                user = await this.ensureUserExists(userId, chatId);
                if (!user) {
                    Logger.error('Failed to ensure user exists', { userId, chatId });
                    const errorMessage = await this.translate(chatId, 'error_reminder');
                    await ctx.reply(errorMessage, await this.getRemindersMenuKeyboard(chatId));
                    return;
                }

                Logger.debug('User retrieved', {
                    userId: user.id,
                    chatId: user.chat_id
                });
            } catch (error) {
                Logger.error('Failed to get user', error, { userId, chatId });
                const errorMessage = await this.translate(chatId, 'error_reminder');
                await ctx.reply(errorMessage, await this.getRemindersMenuKeyboard(chatId));
                return;
            }

            // Check reminder time option
            const minutesBefore = this.REMINDER_OPTIONS[selectedOption];
            if (minutesBefore === undefined) {
                Logger.error('Invalid reminder option selected', { selectedOption });
                const errorMessage = await this.translate(chatId, 'error_reminder');
                await ctx.reply(errorMessage, await this.getRemindersMenuKeyboard(chatId));
                return;
            }
            Logger.debug('Reminder time calculated', {
                option: selectedOption,
                minutesBefore
            });

            // Store reminder in database
            try {
                Logger.debug('Checking for existing reminder', {
                    userId: user.id,
                    chatId,
                    raceId: selectedRace.id
                });

                // Check if the user already has a reminder for this race
                const existingReminder = await this.db.get<Reminder>(
                    'SELECT id FROM reminders WHERE user_id = ? AND event_id = ?',
                    [user.id, selectedRace.id]
                );

                if (existingReminder) {
                    // Update existing reminder
                    Logger.debug('Updating existing reminder', {
                        reminderId: existingReminder.id,
                        newMinutesBefore: minutesBefore
                    });

                    await this.db.run(
                        'UPDATE reminders SET remind_before = ? WHERE id = ?',
                        [minutesBefore, existingReminder.id]
                    );
                    Logger.info('Reminder updated successfully', { reminderId: existingReminder.id });
                } else {
                    // Insert new reminder
                    Logger.debug('Creating new reminder', {
                        userId: user.id,
                        chatId,
                        raceId: selectedRace.id,
                        minutesBefore
                    });

                    await this.db.run(
                        `INSERT INTO reminders 
                        (user_id, chat_id, event_id, remind_before) 
                        VALUES (?, ?, ?, ?)`,
                        [user.id, chatId, selectedRace.id, minutesBefore]
                    );
                    Logger.info('New reminder created successfully');
                }

            } catch (dbError) {
                Logger.error('Database error while processing reminder', dbError, {
                    userId: user.id,
                    chatId,
                    raceId: selectedRace.id
                });
                const errorMessage = await this.translate(chatId, 'error_reminder');
                await ctx.reply(errorMessage, await this.getRemindersMenuKeyboard(chatId));
                return;
            }

            // Clear session context
            delete sessionContext.selectedRace;
            this.sessions.set(chatId, sessionContext);

            // Send confirmation message
            const successMessage = await this.translate(
                chatId,
                'reminder_set',
                {
                    race_name: selectedRace.name,
                    time_before: await this.translate(chatId, selectedOption)
                }
            );
            await ctx.reply(successMessage, await this.getRemindersMenuKeyboard(chatId));
            Logger.info('Reminder set successfully', { userId: user.id, chatId, raceId: selectedRace.id });
        } catch (error) {
            const chatId = this.getChatIdFromContext(ctx);
            Logger.error('Error handling reminder time selection', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_reminder');
            await ctx.reply(errorMessage, await this.getRemindersMenuKeyboard(chatId));
        }
    }

    // Helper to get reminders menu keyboard with translations
    private async getRemindersMenuKeyboard(chatId: number) {
        return Markup.keyboard([
            [
                await this.translate(chatId, 'btn_add_reminder'),
                await this.translate(chatId, 'btn_manage_reminders')
            ],
            [
                await this.translate(chatId, 'back_to_main_menu')
            ]
        ]).resize();
    }

    // Handle managing reminders
    public async handleManageReminders(ctx: Context): Promise<void> {
        Logger.command(ctx, 'manage_reminders');
        const chatId = this.getChatIdFromContext(ctx);

        try {
            // Get user information
            const user = await this.ensureUserExists(ctx);
            if (!user) {
                const errorMessage = await this.translate(chatId, 'error_general');
                await ctx.reply(errorMessage, await this.getRemindersMenuKeyboard(chatId));
                return;
            }

            // Show the reminder management menu
            await this.showReminderManagementMenu(ctx, user.id, chatId);
        } catch (error) {
            Logger.error('Error in handleManageReminders', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_reminder');
            await ctx.reply(errorMessage, await this.getRemindersMenuKeyboard(chatId));
        }
    }

    // Helper to get language selection keyboard with translations
    private async getLanguageMenuKeyboard(chatId: number) {
        return Markup.keyboard([
            [
                await this.translate(chatId, 'btn_english'),
                await this.translate(chatId, 'btn_ukrainian')
            ],
            [
                await this.translate(chatId, 'back_to_main_menu')
            ]
        ]).resize();
    }

    // Helper to get schedule menu keyboard with translations
    private async getScheduleMenuKeyboard(chatId: number) {
        return Markup.keyboard([
            [
                await this.translate(chatId, 'btn_schedule_view'),
                await this.translate(chatId, 'btn_live')
            ],
            [
                await this.translate(chatId, 'back_to_main_menu')
            ]
        ]).resize();
    }

    // New method to handle main schedule menu
    public async handleScheduleMenu(ctx: Context): Promise<void> {
        Logger.command(ctx, 'schedule_menu');
        const chatId = this.getChatIdFromContext(ctx);

        try {
            const titleMessage = await this.translate(chatId, 'schedule_menu_title');

            await ctx.reply(titleMessage, await this.getScheduleMenuKeyboard(chatId));
            Logger.info('Displayed schedule menu', { chatId });
        } catch (error) {
            Logger.error('Error displaying schedule menu', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_general');
            await ctx.reply(errorMessage, await this.getMainMenuKeyboard(chatId));
        }
    }

    // Helper to get results menu keyboard with translations
    private async getResultsMenuKeyboard(chatId: number) {
        return Markup.keyboard([
            [
                await this.translate(chatId, 'btn_race_results'),
                await this.translate(chatId, 'btn_pit_stops')
            ],
            [
                await this.translate(chatId, 'back_to_main_menu')
            ]
        ]).resize();
    }

    // New method to handle main results menu
    public async handleResultsMenu(ctx: Context): Promise<void> {
        Logger.command(ctx, 'results_menu');
        const chatId = this.getChatIdFromContext(ctx);

        try {
            const titleMessage = await this.translate(chatId, 'results_menu_title');

            await ctx.reply(titleMessage, await this.getResultsMenuKeyboard(chatId));
            Logger.info('Displayed results menu', { chatId });
        } catch (error) {
            Logger.error('Error displaying results menu', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_general');
            await ctx.reply(errorMessage, await this.getMainMenuKeyboard(chatId));
        }
    }

    // Handle exit button - remove keyboard
    public async handleExit(ctx: Context): Promise<void> {
        Logger.command(ctx, 'exit');
        const chatId = this.getChatIdFromContext(ctx);

        try {
            const exitMessage = await this.translate(chatId, 'menu_closed');

            // Send message with RemoveKeyboard markup
            await ctx.reply(exitMessage, Markup.removeKeyboard());

            Logger.info('Removed keyboard', { chatId });
        } catch (error) {
            Logger.error('Error handling exit button', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_general');
            await ctx.reply(errorMessage);
        }
    }

    // Handle /menu command - show main menu
    public async handleMenu(ctx: Context): Promise<void> {
        Logger.command(ctx, 'menu');
        const chatId = this.getChatIdFromContext(ctx);

        try {
            const menuMessage = await this.translate(chatId, 'menu_opened');

            // Send message with main menu keyboard
            await ctx.reply(menuMessage, await this.getMainMenuKeyboard(chatId));

            Logger.info('Opened main menu', { chatId });
        } catch (error) {
            Logger.error('Error handling menu command', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_general');
            await ctx.reply(errorMessage);
        }
    }
}
