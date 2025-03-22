import { Context } from 'telegraf';
import { DatabaseService } from '../database';
import { ErgastService } from '../services/ergast';
import moment from 'moment-timezone';
import { Message } from 'telegraf/types';
import { Logger } from '../utils/logger';
import { getTranslation, isValidLanguage, LanguageCode, languageNames } from '../locale';
import { Markup } from 'telegraf';

export class CommandHandlers {
    private db: DatabaseService;

    private constructor(db: DatabaseService) {
        this.db = db;
    }

    public static async create(): Promise<CommandHandlers> {
        const db = await DatabaseService.getInstance();
        Logger.info('CommandHandlers initialized');
        return new CommandHandlers(db);
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
            const mainMenuButtons = Markup.keyboard([
                ['🏁 Schedule', '🏆 Driver Standings'],
                ['🛠️ Constructor Standings', '🏎️ Results'],
                ['⏱️ Live', '🛑 Pit Stops'],
                ['🌐 Language Settings']
            ]).resize();

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
            const languageButtons = Markup.keyboard([
                ['🇬🇧 English', '🇺🇦 Ukrainian'],
                ['⬅️ Back to Main Menu']
            ]).resize();

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
            const mainMenuButtons = Markup.keyboard([
                ['🏁 Schedule', '🏆 Driver Standings'],
                ['🛠️ Constructor Standings', '🏎️ Results'],
                ['⏱️ Live', '🛑 Pit Stops'],
                ['🌐 Language Settings']
            ]).resize();

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
            const mainMenuButtons = Markup.keyboard([
                ['🏁 Schedule', '🏆 Driver Standings'],
                ['🛠️ Constructor Standings', '🏎️ Results'],
                ['⏱️ Live', '🛑 Pit Stops'],
                ['🌐 Language Settings']
            ]).resize();

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

                    const roundMessage = await this.translate(chatId, 'race_round', {
                        round: race.round,
                        raceName: race.raceName
                    });
                    message += `${roundMessage}\n`;

                    const locationMessage = await this.translate(chatId, 'race_location', {
                        locality: race.Circuit.Location.locality,
                        country: race.Circuit.Location.country
                    });
                    message += `${locationMessage}\n`;

                    const circuitMessage = await this.translate(chatId, 'race_circuit', {
                        circuitName: race.Circuit.circuitName
                    });
                    message += `${circuitMessage}\n`;

                    const timeMessage = await this.translate(chatId, 'race_time', {
                        date: raceTime.format('MMMM D, YYYY HH:mm'),
                        timezone: timezone
                    });
                    message += `${timeMessage}\n`;

                    // Add session times if available
                    if (race.FirstPractice) {
                        const fp1Time = moment.tz(`${race.FirstPractice.date} ${race.FirstPractice.time}`, timezone);
                        const fp1Message = await this.translate(chatId, 'fp1', {
                            time: fp1Time.format('MMMM D, HH:mm')
                        });
                        message += `${fp1Message}\n`;
                    }
                    if (race.SecondPractice) {
                        const fp2Time = moment.tz(`${race.SecondPractice.date} ${race.SecondPractice.time}`, timezone);
                        const fp2Message = await this.translate(chatId, 'fp2', {
                            time: fp2Time.format('MMMM D, HH:mm')
                        });
                        message += `${fp2Message}\n`;
                    }
                    if (race.ThirdPractice) {
                        const fp3Time = moment.tz(`${race.ThirdPractice.date} ${race.ThirdPractice.time}`, timezone);
                        const fp3Message = await this.translate(chatId, 'fp3', {
                            time: fp3Time.format('MMMM D, HH:mm')
                        });
                        message += `${fp3Message}\n`;
                    }
                    if (race.Sprint) {
                        const sprintTime = moment.tz(`${race.Sprint.date} ${race.Sprint.time}`, timezone);
                        const sprintMessage = await this.translate(chatId, 'sprint', {
                            time: sprintTime.format('MMMM D, HH:mm')
                        });
                        message += `${sprintMessage}\n`;
                    }
                    if (race.Qualifying) {
                        const qualiTime = moment.tz(`${race.Qualifying.date} ${race.Qualifying.time}`, timezone);
                        const qualiMessage = await this.translate(chatId, 'qualifying', {
                            time: qualiTime.format('MMMM D, HH:mm')
                        });
                        message += `${qualiMessage}\n`;
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

                    const locationMessage = await this.translate(chatId, 'race_location', {
                        locality: race.Circuit.Location.locality,
                        country: race.Circuit.Location.country
                    });
                    message += `${locationMessage}\n`;

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
            const mainMenuButtons = Markup.keyboard([
                ['🏁 Schedule', '🏆 Driver Standings'],
                ['🛠️ Constructor Standings', '🏎️ Results'],
                ['⏱️ Live', '🛑 Pit Stops'],
                ['🌐 Language Settings']
            ]).resize();

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

    public async handleDriverStandings(ctx: Context): Promise<void> {
        Logger.command(ctx, 'driverstandings');
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        try {
            // Get the current driver standings
            const standings = await ErgastService.getDriverStandings();
            Logger.info('Retrieved driver standings', { chatId, count: standings.length });

            // Format the standings message
            const headerMessage = await this.translate(chatId, 'driver_standings_header');
            let message = `${headerMessage}\n\n`;

            // Use a counter for sequential numbering
            let positionCounter = 1;

            for (const standing of standings.slice(0, 20)) { // Limit to top 20
                // Use either the valid API position or our sequential position counter
                const position = (standing.position && standing.position !== "-") ?
                    standing.position :
                    positionCounter.toString();

                const formattedStanding = await this.translate(chatId, 'driver_standing_entry', {
                    position: position,
                    name: `${standing.Driver.givenName} ${standing.Driver.familyName}`,
                    team: standing.Constructors[0].name,
                    points: standing.points
                });
                message += `${formattedStanding}\n`;

                // Always increment our counter
                positionCounter++;
            }

            // Return to main menu keyboard
            const mainMenuButtons = Markup.keyboard([
                ['🏁 Schedule', '🏆 Driver Standings'],
                ['🛠️ Constructor Standings', '🏎️ Results'],
                ['⏱️ Live', '🛑 Pit Stops'],
                ['🌐 Language Settings']
            ]).resize();

            await ctx.reply(message, mainMenuButtons);
            Logger.info('Displayed driver standings', { chatId });
        } catch (error) {
            Logger.error('Error in handleDriverStandings', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_general');
            await ctx.reply(errorMessage);
        }
    }

    public async handleConstructorStandings(ctx: Context): Promise<void> {
        Logger.command(ctx, 'constructorstandings');
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        try {
            // Get the current constructor standings
            const standings = await ErgastService.getConstructorStandings();
            Logger.info('Retrieved constructor standings', { chatId, count: standings.length });

            // Format the standings message
            const headerMessage = await this.translate(chatId, 'constructor_standings_header');
            let message = `${headerMessage}\n\n`;

            // Use a counter for sequential numbering
            let positionCounter = 1;

            for (const standing of standings) {
                // Use either the valid API position or our sequential position counter
                const position = (standing.position && standing.position !== "-") ?
                    standing.position :
                    positionCounter.toString();

                const formattedStanding = await this.translate(chatId, 'constructor_standing_entry', {
                    position: position,
                    name: standing.Constructor.name,
                    points: standing.points
                });
                message += `${formattedStanding}\n`;

                // Always increment our counter
                positionCounter++;
            }

            // Return to main menu keyboard
            const mainMenuButtons = Markup.keyboard([
                ['🏁 Schedule', '🏆 Driver Standings'],
                ['🛠️ Constructor Standings', '🏎️ Results'],
                ['⏱️ Live', '🛑 Pit Stops'],
                ['🌐 Language Settings']
            ]).resize();

            await ctx.reply(message, mainMenuButtons);
            Logger.info('Displayed constructor standings', { chatId });
        } catch (error) {
            Logger.error('Error in handleConstructorStandings', error, { chatId });
            const errorMessage = await this.translate(chatId, 'error_general');
            await ctx.reply(errorMessage);
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
            const mainMenuButtons = Markup.keyboard([
                ['🏁 Schedule', '🏆 Driver Standings'],
                ['🛠️ Constructor Standings', '🏎️ Results'],
                ['⏱️ Live', '🛑 Pit Stops'],
                ['🌐 Language Settings']
            ]).resize();

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
            const mainMenuButtons = Markup.keyboard([
                ['🏁 Schedule', '🏆 Driver Standings'],
                ['🛠️ Constructor Standings', '🏎️ Results'],
                ['⏱️ Live', '🛑 Pit Stops'],
                ['🌐 Language Settings']
            ]).resize();

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
            const mainMenuButtons = Markup.keyboard([
                ['🏁 Schedule', '🏆 Driver Standings'],
                ['🛠️ Constructor Standings', '🏎️ Results'],
                ['⏱️ Live', '🛑 Pit Stops'],
                ['🌐 Language Settings']
            ]).resize();

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
                const mainMenuButtons = Markup.keyboard([
                    ['🏁 Schedule', '🏆 Driver Standings'],
                    ['🛠️ Constructor Standings', '🏎️ Results'],
                    ['⏱️ Live', '🛑 Pit Stops'],
                    ['🌐 Language Settings']
                ]).resize();

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

            const titleMessage = await this.translate(chatId, 'next_race_title', {
                raceName: nextRace.raceName
            });

            const roundMessage = await this.translate(chatId, 'next_race_round', {
                round: nextRace.round,
                year: currentYear
            });

            const circuitMessage = await this.translate(chatId, 'next_race_circuit', {
                circuitName: nextRace.Circuit.circuitName
            });

            const locationMessage = await this.translate(chatId, 'next_race_location', {
                locality: nextRace.Circuit.Location.locality,
                country: nextRace.Circuit.Location.country
            });

            // Add race date and time with user timezone
            const raceDate = moment.tz(`${nextRace.date}T${nextRace.time || '00:00:00Z'}`, timezone);
            const dateMessage = await this.translate(chatId, 'next_race_date', {
                date: raceDate.format('MMMM D, YYYY HH:mm'),
                timezone: timezone
            });

            // Calculate countdown
            const now = moment().tz(timezone);
            const duration = moment.duration(raceDate.diff(now));
            const days = Math.floor(duration.asDays());
            const hours = duration.hours();
            const minutes = duration.minutes();

            const countdownMessage = await this.translate(chatId, 'countdown', {
                days,
                hours,
                minutes
            });

            let message = `${titleMessage}\n${roundMessage}\n${circuitMessage}\n${locationMessage}\n${dateMessage}\n${countdownMessage}\n\n`;

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
            const mainMenuButtons = Markup.keyboard([
                ['🏁 Schedule', '🏆 Driver Standings'],
                ['🛠️ Constructor Standings', '🏎️ Results'],
                ['⏱️ Live', '🛑 Pit Stops'],
                ['🌐 Language Settings']
            ]).resize();

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
                const mainMenuButtons = Markup.keyboard([
                    ['🏁 Schedule', '🏆 Driver Standings'],
                    ['🛠️ Constructor Standings', '🏎️ Results'],
                    ['⏱️ Live', '🛑 Pit Stops'],
                    ['🌐 Language Settings']
                ]).resize();

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
            const mainMenuButtons = Markup.keyboard([
                ['🏁 Schedule', '🏆 Driver Standings'],
                ['🛠️ Constructor Standings', '🏎️ Results'],
                ['⏱️ Live', '🛑 Pit Stops'],
                ['🌐 Language Settings']
            ]).resize();

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
                const mainMenuButtons = Markup.keyboard([
                    ['🏁 Schedule', '🏆 Driver Standings'],
                    ['🛠️ Constructor Standings', '🏎️ Results'],
                    ['⏱️ Live', '🛑 Pit Stops'],
                    ['🌐 Language Settings']
                ]).resize();

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
                const mainMenuButtons = Markup.keyboard([
                    ['🏁 Schedule', '🏆 Driver Standings'],
                    ['🛠️ Constructor Standings', '🏎️ Results'],
                    ['⏱️ Live', '🛑 Pit Stops'],
                    ['🌐 Language Settings']
                ]).resize();

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
            const mainMenuButtons = Markup.keyboard([
                ['🏁 Schedule', '🏆 Driver Standings'],
                ['🛠️ Constructor Standings', '🏎️ Results'],
                ['⏱️ Live', '🛑 Pit Stops'],
                ['🌐 Language Settings']
            ]).resize();

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
}
