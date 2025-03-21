Project Overview
The goal is to create a Telegram bot for Formula 1 enthusiasts that provides timely race information, standings, results, and interactive features. The bot will be built using TypeScript for type safety and maintainability, leveraging free tools and services wherever possible.

Chosen Tools
Telegram Bot Framework: Telegraf
Reason: Popular, well-maintained, TypeScript-ready, and has extensive documentation and community support.
Formula 1 Data Source: Ergast Developer API
Reason: Free, reliable, provides historical and current F1 data (schedules, standings, results), though it lacks real-time updates.
Database: SQLite
Reason: Lightweight, serverless, and simple to set up for small-scale applications like this bot.
Scheduling: node-schedule
Reason: Easy-to-use library for scheduling tasks like reminders and periodic updates.
Timezone Handling: moment-timezone
Reason: Robust library for converting and formatting times across timezones.
Deployment: Heroku
Reason: Free tier available, simple setup for hosting a Telegram bot.
Development Setup
Initialize Project:
Create a new TypeScript project: npm init -y && tsc --init.
Install dependencies: npm install telegraf sqlite3 node-schedule moment-timezone axios.
Configure TypeScript (tsconfig.json) with strict mode and ESNext target.
Database Setup:
Initialize SQLite with tables for users (ID, timezone), race schedules, standings, results, reminders, and cached data.
Bot Setup:
Register the bot with Telegram’s BotFather to get an API token.
Set up Telegraf with the token and basic command handlers.
Features by Priority
High Priority Features
1. Race Schedules
Description: Send upcoming race dates, times, and locations in the user's timezone.
Implementation:
Fetch race schedule from Ergast API (/api/f1/current.json).
Store in SQLite table: races (id, name, date, time, location).
Command: /schedule – Retrieve upcoming races from DB, convert times using moment-timezone based on user’s stored timezone, and send formatted response.
Allow users to set timezone with /settimezone <tz> (e.g., /settimezone America/New_York).
2. Live Updates
Description: Share real-time race info like leaderboards, lap times, and pit stops.
Implementation:
Note: Ergast API lacks real-time data. As a fallback, fetch latest race results (/api/f1/current/last/results.json) every 5 minutes using node-schedule.
Store in SQLite table: live_updates (race_id, timestamp, data).
Command: /live – Fetch and display the latest cached data.
Future improvement: Explore unofficial sources or scraping (with legal caution).
3. Driver Standings
Description: Provide current championship standings with points and rankings.
Implementation:
Fetch from Ergast API (/api/f1/current/driverStandings.json).
Store in SQLite table: driver_standings (position, driver_name, points, team).
Command: /driverstandings – Retrieve from DB and send formatted list.
Update DB after each race using a scheduled task.
4. Constructor Standings
Description: Show team rankings and points in the constructors' championship.
Implementation:
Fetch from Ergast API (/api/f1/current/constructorStandings.json).
Store in SQLite table: constructor_standings (position, team_name, points).
Command: /constructorstandings – Retrieve from DB and send formatted list.
Update DB post-race via scheduler.
5. Qualifying Results
Description: Post quali session outcomes with times and grid positions.
Implementation:
Fetch from Ergast API (/api/f1/current/last/qualifying.json) after each session.
Store in SQLite table: qualifying_results (race_id, position, driver_name, time).
Command: /qualifying – Fetch latest results from DB and send.
6. Race Results
Description: Share final race results, including podiums and notable incidents.
Implementation:
Fetch from Ergast API (/api/f1/current/last/results.json) post-race.
Store in SQLite table: race_results (race_id, position, driver_name, time, status).
Command: /results – Fetch latest results from DB and send.
7. Reminders
Description: Notify users before races, quali sessions, or major events.
Implementation:
Command: /remind <event> <time> (e.g., /remind race 1h for 1 hour before).
Store in SQLite table: reminders (user_id, event_id, time, chat_id).
Use node-schedule to trigger notifications via Telegraf’s telegram.sendMessage.
Medium Priority Features
8. News Alerts
Description: Deliver breaking F1 news from reliable sources.
Implementation:
Use NewsAPI with F1 keywords (free tier available).
Store in SQLite table: news (id, title, url, timestamp).
Command: /news – Fetch and send the latest 5 articles.
Update DB every hour with node-schedule.
9. Circuit Info
Description: Provide details on each track—layout, history, and records.
Implementation:
Fetch from Ergast API (/api/f1/circuits.json).
Store in SQLite table: circuits (id, name, location, length, record).
Command: /circuit <name> – Fetch and send info for the specified circuit.
10. Driver Stats
Description: Offer profiles with career stats, wins, and team history.
Implementation:
Fetch from Ergast API (/api/f1/drivers/<driverId>.json).
Store in SQLite table: drivers (id, name, wins, podiums, team_history).
Command: /driver <name> – Fetch and send stats for the specified driver.
11. Timezone Converter
Description: Help fans convert session times to their local time.
Implementation:
Integrated with /schedule and /remind – Use moment-timezone to display times in user’s timezone (stored in users table).
Command: /convert <time> <event> – Convert a specific event time manually.
Low Priority Features
12. Interactive Polls
Description: Let users vote on race predictions or driver performances.
Implementation:
Use Telegraf’s telegram.sendPoll to create polls (e.g., “Who will win the next race?”).
Store results in SQLite table: polls (id, question, options, votes).
Command: /poll – Send a new poll.
13. Trivia/Quizzes
Description: Engage fans with F1 history questions or fun facts.
Implementation:
Hardcode a list of questions and answers in a TypeScript file.
Command: /trivia – Send a question, wait for reply, and validate answer.
Optional: Store user scores in SQLite table: trivia_scores (user_id, score).
14. Paddock Rumors
Description: Share credible gossip or insider tidbits on teams and drivers.
Implementation:
Manual curation for now (no reliable free API).
Command: /rumors – Send pre-stored rumors from a static list.
Future: Explore scraping forums (e.g., Reddit) with caution.
Architecture Overview
Bot Logic: Telegraf handles Telegram interactions via commands and messages.
Data Flow:
Fetch data from Ergast API → Cache in SQLite → Serve to users.
Periodic updates via node-schedule.
User Management: Store user preferences (timezone, reminders) in SQLite.
Timezone Handling: moment-timezone ensures all times are user-specific.
Development Steps
Project Setup: Initialize TypeScript, install dependencies, configure Telegraf and SQLite.
User Management: Implement /settimezone and user DB table.
High Priority Features: Build race schedules, standings, results, live updates, and reminders.
Medium Priority Features: Add news, circuit info, driver stats, and timezone conversion.
Low Priority Features: Implement polls, trivia, and rumors as time allows.
Testing: Test commands locally with a Telegram test bot.
Deployment: Deploy to Heroku, set up webhook with Telegraf, and monitor.
Deployment
Host on Heroku’s free tier.
Set environment variable for Telegram bot token.
Use Heroku Scheduler for periodic tasks if node-schedule isn’t sufficient.
This technical task provides a comprehensive roadmap for developing a feature-rich Formula 1 Telegram bot using TypeScript, free tools, and a prioritized feature set. Start with high-priority features to deliver core value quickly, then expand to medium and low-priority features as needed.