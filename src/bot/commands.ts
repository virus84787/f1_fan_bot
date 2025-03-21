import { Context } from 'telegraf';
import { DatabaseService } from '../database';
import { ErgastService } from '../services/ergast';
import moment from 'moment-timezone';
import { Message } from 'telegraf/types';
import { Logger } from '../utils/logger';

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

    public async handleStart(ctx: Context): Promise<void> {
        Logger.command(ctx, 'start');
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        try {
            await this.db.run(
                'INSERT OR IGNORE INTO users (id, chat_id) VALUES (?, ?)',
                [ctx.from?.id, chatId]
            );
            Logger.info('New user registered', { userId: ctx.from?.id, chatId });

            await ctx.reply(
                'Welcome to F1 Fan Bot! 🏎️\n\n' +
                'Available commands:\n' +
                '/schedule - View upcoming races\n' +
                '/driverstandings - Current driver standings\n' +
                '/constructorstandings - Current constructor standings\n' +
                '/settimezone - Set your timezone\n' +
                '/remind - Set race reminders\n' +
                '/live - Get next race information\n' +
                '/pitstops - View last race results\n' +
                '/driver - Get driver info (use: /driver Hamilton)\n' +
                '/results - Get last race results\n' +
                '/apistatus - Check or change data source'
            );
        } catch (error) {
            Logger.error('Error in handleStart', error, { chatId });
            await ctx.reply('Sorry, there was an error starting the bot. Please try again later.');
        }
    }

    public async handleSchedule(ctx: Context): Promise<void> {
        Logger.command(ctx, 'schedule');
        try {
            const currentYear = ErgastService.getCurrentYear();
            Logger.info(`Fetching schedule for ${currentYear}`);

            const races = await ErgastService.getCurrentSchedule();
            Logger.info('Retrieved race schedule', { raceCount: races.length, year: currentYear });

            const user = await this.db.get<{ timezone: string }>(
                'SELECT timezone FROM users WHERE chat_id = ?',
                [ctx.chat?.id]
            );
            Logger.info('Retrieved user timezone', {
                chatId: ctx.chat?.id,
                timezone: user?.timezone || 'UTC'
            });

            const timezone = user?.timezone || 'UTC';
            const now = moment();

            // Split races into upcoming and past
            const upcomingRaces = races
                .filter(race => moment(`${race.date} ${race.time || '00:00:00'}`).isAfter(now))
                .slice(0, 5);

            const pastRaces = races
                .filter(race => moment(`${race.date} ${race.time || '00:00:00'}`).isBefore(now))
                .slice(-5)
                .reverse();

            let message = `📅 F1 ${currentYear} Season Schedule\n\n`;

            // Show upcoming races if available
            if (upcomingRaces.length > 0) {
                message += '🔜 Upcoming Races:\n\n';
                upcomingRaces.forEach(race => {
                    const raceTime = moment.tz(`${race.date} ${race.time || '00:00:00'}`, timezone);
                    message += `🏁 Round ${race.round}: ${race.raceName}\n`;
                    message += `📍 ${race.Circuit.Location.locality}, ${race.Circuit.Location.country}\n`;
                    message += `🏎️ ${race.Circuit.circuitName}\n`;
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
                });
            } else if (currentYear > new Date().getFullYear()) {
                message += `⚠️ The ${currentYear} F1 schedule has not been released yet.\n\n`;
            } else {
                message += '⚠️ No upcoming races scheduled for the rest of the season.\n\n';
            }

            // Show past races if there are any
            if (pastRaces.length > 0) {
                message += '📅 Recent Past Races:\n\n';
                pastRaces.forEach(race => {
                    const raceTime = moment.tz(`${race.date} ${race.time || '00:00:00'}`, timezone);
                    message += `🏁 Round ${race.round}: ${race.raceName}\n`;
                    message += `📍 ${race.Circuit.Location.locality}, ${race.Circuit.Location.country}\n`;
                    message += `📅 ${raceTime.format('MMMM D, YYYY')}\n\n`;
                });
            } else if (currentYear > new Date().getFullYear()) {
                // Don't add anything for future years with no past races
            } else {
                message += '⚠️ No races have taken place this season yet.\n';
            }

            // If no races at all
            if (races.length === 0) {
                message = `❌ No race schedule available for the ${currentYear} F1 season. Please try again later.`;
            }

            await ctx.reply(message);
            Logger.info('Sent schedule message', {
                chatId: ctx.chat?.id,
                upcomingRacesCount: upcomingRaces.length,
                pastRacesCount: pastRaces.length,
                totalRaces: races.length,
                year: currentYear
            });
        } catch (error) {
            Logger.error('Error in handleSchedule', error, { chatId: ctx.chat?.id });
            await ctx.reply('Sorry, there was an error fetching the schedule. Please try again later.');
        }
    }

    public async handleDriverStandings(ctx: Context): Promise<void> {
        Logger.command(ctx, 'driverstandings');
        try {
            const standings = await ErgastService.getDriverStandings();
            Logger.info('Retrieved driver standings', { count: standings.length });

            let message = '🏆 Current Driver Standings:\n\n';
            standings.slice(0, 10).forEach((standing, index) => {
                message += `${index + 1}. ${standing.Driver.givenName} ${standing.Driver.familyName}\n`;
                message += `   Points: ${standing.points} | Wins: ${standing.wins}\n`;
                message += `   Team: ${standing.Constructors[0].name}\n\n`;
            });

            await ctx.reply(message);
            Logger.info('Sent driver standings message', { chatId: ctx.chat?.id });
        } catch (error) {
            Logger.error('Error in handleDriverStandings', error, { chatId: ctx.chat?.id });
            await ctx.reply('Sorry, there was an error fetching the driver standings. Please try again later.');
        }
    }

    public async handleConstructorStandings(ctx: Context): Promise<void> {
        Logger.command(ctx, 'constructorstandings');
        try {
            const standings = await ErgastService.getConstructorStandings();
            Logger.info('Retrieved constructor standings', { count: standings.length });

            let message = '🏭 Current Constructor Standings:\n\n';
            standings.forEach((standing, index) => {
                message += `${index + 1}. ${standing.Constructor.name}\n`;
                message += `   Points: ${standing.points} | Wins: ${standing.wins}\n\n`;
            });

            await ctx.reply(message);
            Logger.info('Sent constructor standings message', { chatId: ctx.chat?.id });
        } catch (error) {
            Logger.error('Error in handleConstructorStandings', error, { chatId: ctx.chat?.id });
            await ctx.reply('Sorry, there was an error fetching the constructor standings. Please try again later.');
        }
    }

    public async handleSetTimezone(ctx: Context): Promise<void> {
        Logger.command(ctx, 'settimezone');
        const message = ctx.message as Message.TextMessage | undefined;
        if (!message?.text) return;

        const timezone = message.text.split(' ')[1];
        if (!timezone || !moment.tz.zone(timezone)) {
            Logger.info('Invalid timezone provided', {
                chatId: ctx.chat?.id,
                attemptedTimezone: timezone
            });
            await ctx.reply(
                'Please provide a valid timezone. Example:\n' +
                '/settimezone Europe/London\n\n' +
                'Find your timezone here: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones'
            );
            return;
        }

        try {
            await this.db.run(
                'UPDATE users SET timezone = ? WHERE chat_id = ?',
                [timezone, ctx.chat?.id]
            );
            Logger.info('Timezone updated', {
                chatId: ctx.chat?.id,
                newTimezone: timezone
            });
            await ctx.reply(`Timezone successfully set to ${timezone}`);
        } catch (error) {
            Logger.error('Error in handleSetTimezone', error, {
                chatId: ctx.chat?.id,
                attemptedTimezone: timezone
            });
            await ctx.reply('Sorry, there was an error setting your timezone. Please try again later.');
        }
    }

    public async handleResults(ctx: Context): Promise<void> {
        Logger.command(ctx, 'results');
        try {
            const lastRace = await ErgastService.getLastRaceResults();
            Logger.info('Retrieved last race results', {
                raceName: lastRace.raceName,
                resultCount: lastRace.Results.length,
                date: lastRace.date
            });

            const user = await this.db.get<{ timezone: string }>(
                'SELECT timezone FROM users WHERE chat_id = ?',
                [ctx.chat?.id]
            );
            const timezone = user?.timezone || 'UTC';

            const raceDate = moment.tz(`${lastRace.date} ${lastRace.time || '00:00:00'}`, timezone);
            let message = `🏁 ${lastRace.raceName}\n`;
            message += `📅 ${raceDate.format('MMMM D, YYYY')}\n`;
            message += `⏰ ${raceDate.format('HH:mm')} ${timezone}\n\n`;
            message += `Results:\n\n`;

            lastRace.Results.slice(0, 10).forEach((result: any) => {
                message += `${result.position}. ${result.Driver.givenName} ${result.Driver.familyName}\n`;
                message += `   Time: ${result.Time?.time || 'DNF'}\n`;
                message += `   Points: ${result.points}\n\n`;
            });

            await ctx.reply(message);
            Logger.info('Sent race results message', {
                chatId: ctx.chat?.id,
                raceDate: lastRace.date,
                timezone
            });
        } catch (error) {
            Logger.error('Error in handleResults', error, { chatId: ctx.chat?.id });
            await ctx.reply('Sorry, there was an error fetching the race results. Please try again later.');
        }
    }

    public async handleLive(ctx: Context): Promise<void> {
        Logger.command(ctx, 'live');
        try {
            const currentYear = ErgastService.getCurrentYear();

            // Get the next race from Ergast
            const nextRace = await ErgastService.getNextRace();

            if (!nextRace) {
                await ctx.reply(`No upcoming races found for the ${currentYear} season.`);
                return;
            }

            const drivers = await ErgastService.getDriverStandings();

            let message = `🏎️ ${currentYear} F1 Season\n`;
            message += `📅 Next Race: ${nextRace.raceName}\n`;
            message += `📍 ${nextRace.Circuit.Location.locality}, ${nextRace.Circuit.Location.country}\n`;
            message += `🏁 ${nextRace.Circuit.circuitName}\n\n`;

            // Add race date and time
            const raceDate = moment(`${nextRace.date}T${nextRace.time || '00:00:00Z'}`);
            message += `⏰ Race: ${raceDate.format('MMMM D, YYYY HH:mm')} UTC\n\n`;

            // Add qualifying and practice sessions if available
            if (nextRace.Qualifying) {
                const qualiDate = moment(`${nextRace.Qualifying.date}T${nextRace.Qualifying.time}`);
                message += `🕒 Qualifying: ${qualiDate.format('MMMM D, HH:mm')} UTC\n`;
            }

            if (nextRace.FirstPractice) {
                const fp1Date = moment(`${nextRace.FirstPractice.date}T${nextRace.FirstPractice.time}`);
                message += `🕒 Practice 1: ${fp1Date.format('MMMM D, HH:mm')} UTC\n`;
            }

            if (nextRace.Sprint) {
                const sprintDate = moment(`${nextRace.Sprint.date}T${nextRace.Sprint.time}`);
                message += `🕒 Sprint: ${sprintDate.format('MMMM D, HH:mm')} UTC\n`;
            }

            // Add top 3 drivers from standings
            if (drivers.length > 0) {
                message += "\n📊 Current Standings (Top 3):\n";
                drivers.slice(0, 3).forEach(driver => {
                    message += `${driver.position}. ${driver.Driver.givenName} ${driver.Driver.familyName} - ${driver.points} points\n`;
                });
            }

            await ctx.reply(message);
            Logger.info('Sent live session information', {
                chatId: ctx.chat?.id,
                nextRace: nextRace.raceName
            });
        } catch (error) {
            Logger.error('Error in handleLive', error, { chatId: ctx.chat?.id });
            await ctx.reply('Sorry, there was an error fetching live data. Please try again later.');
        }
    }

    public async handlePitStops(ctx: Context): Promise<void> {
        Logger.command(ctx, 'pitstops');
        try {
            const currentYear = ErgastService.getCurrentYear();

            // Get the last race result instead
            const lastRace = await ErgastService.getLastRaceResults();

            if (!lastRace) {
                await ctx.reply(`No race data available for the ${currentYear} season yet.`);
                return;
            }

            let message = `🔧 ${currentYear} F1 Season - ${lastRace.raceName} Results:\n\n`;

            if (lastRace.Results && lastRace.Results.length > 0) {
                lastRace.Results.slice(0, 10).forEach((result: any, index: number) => {
                    const position = result.position;
                    const driverName = `${result.Driver.givenName} ${result.Driver.familyName}`;
                    const team = result.Constructor.name;
                    const time = result.Time ? result.Time.time : 'DNF';

                    message += `${position}. ${driverName} (${team}) - ${time}\n`;
                });
            } else {
                message += "No results data available for this race.";
            }

            await ctx.reply(message);
            Logger.info('Sent race results', {
                chatId: ctx.chat?.id,
                raceName: lastRace.raceName
            });
        } catch (error) {
            Logger.error('Error in handlePitStops', error, { chatId: ctx.chat?.id });
            await ctx.reply('Sorry, there was an error fetching race data. Please try again later.');
        }
    }

    public async handleDriverInfo(ctx: Context): Promise<void> {
        Logger.command(ctx, 'driver');
        try {
            const currentYear = ErgastService.getCurrentYear();
            const msgText = ctx.message as Message.TextMessage | undefined;
            if (!msgText?.text) return;

            // Extract driver name or number from command
            const driverQuery = msgText.text.split(' ').slice(1).join(' ').trim();

            if (!driverQuery) {
                await ctx.reply(
                    'Please provide a driver name or number. Examples:\n' +
                    '/driver Hamilton\n' +
                    '/driver 44'
                );
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
                await ctx.reply(`Driver not found in ${currentYear} F1 season.`);
                return;
            }

            const driver = foundDriver.Driver;
            const constructor = foundDriver.Constructors[0];

            let responseMsg = `👤 ${currentYear} F1 Season\n`;
            responseMsg += `🏎️ ${driver.givenName} ${driver.familyName}\n`;
            responseMsg += `🏢 ${constructor.name}\n`;

            // Add optional fields with null checks
            if (driver.permanentNumber) {
                responseMsg += `🔢 ${driver.permanentNumber}\n`;
            }

            if (driver.nationality) {
                responseMsg += `🌍 ${driver.nationality}\n`;
            }

            responseMsg += `📊 Position: ${foundDriver.position}\n`;
            responseMsg += `💯 Points: ${foundDriver.points}\n`;
            responseMsg += `🏆 Wins: ${foundDriver.wins}\n`;

            // Add Wikipedia link if available
            if (driver.url) {
                responseMsg += `\nℹ️ More info: ${driver.url}\n`;
            }

            await ctx.reply(responseMsg);
            Logger.info('Sent driver info', {
                chatId: ctx.chat?.id,
                driverName: `${driver.givenName} ${driver.familyName}`,
                year: currentYear
            });
        } catch (error) {
            Logger.error('Error in handleDriverInfo', error, { chatId: ctx.chat?.id });
            await ctx.reply('Sorry, there was an error fetching driver data. Please try again later.');
        }
    }

    public async handleApiStatus(ctx: Context): Promise<void> {
        Logger.command(ctx, 'apistatus');
        try {
            const message = ctx.message as Message.TextMessage | undefined;
            const command = message?.text?.split(' ')[1]?.toLowerCase() || '';

            if (command === 'alternative' || command === 'alt') {
                ErgastService.forceAlternativeApi();
                await ctx.reply('✅ Switched to alternative Ergast API (jolpi.ca)');
                Logger.info('User switched to alternative API', { chatId: ctx.chat?.id });
            } else if (command === 'primary' || command === 'main') {
                ErgastService.resetApiChoice();
                await ctx.reply('✅ Switched to primary Ergast API (ergast.com)');
                Logger.info('User switched to primary API', { chatId: ctx.chat?.id });
            } else if (command === 'stats') {
                // Show API usage statistics
                const apiStats = ErgastService.getApiStats();
                const currentYear = ErgastService.getCurrentYear();

                await ctx.reply(
                    `📊 F1 Data API Usage Stats (${currentYear}):\n\n` +
                    `Total API calls: ${apiStats.total}\n` +
                    `Successful calls: ${apiStats.success} (${apiStats.successRate})\n` +
                    `Failed calls: ${apiStats.failed}\n\n` +
                    `Primary API (ergast.com): ${apiStats.primary} calls (${apiStats.primaryRate})\n` +
                    `Fallback API (jolpi.ca): ${apiStats.fallback} calls (${apiStats.fallbackRate})\n`
                );
                Logger.info('Displayed API stats', {
                    chatId: ctx.chat?.id,
                    apiStats
                });
            } else {
                // Just show status
                const currentYear = ErgastService.getCurrentYear();
                const apiStatus = ErgastService.getCurrentApiStatus();

                await ctx.reply(
                    `📊 F1 Data APIs Status:\n\n` +
                    `🏎️ F1 Season: ${currentYear}\n` +
                    `🔄 ${apiStatus}\n\n` +
                    `Commands:\n` +
                    `• /apistatus - Show current API status\n` +
                    `• /apistatus alt - Switch to alternative API\n` +
                    `• /apistatus primary - Switch to primary API\n` +
                    `• /apistatus stats - View API usage statistics`
                );
                Logger.info('Displayed API status', {
                    chatId: ctx.chat?.id,
                    currentApi: apiStatus
                });
            }
        } catch (error) {
            Logger.error('Error in handleApiStatus', error, { chatId: ctx.chat?.id });
            await ctx.reply('Sorry, there was an error managing API settings. Please try again later.');
        }
    }
}
