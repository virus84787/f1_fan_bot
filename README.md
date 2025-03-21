# F1 Fan Telegram Bot

A Telegram bot for Formula 1 enthusiasts that provides race information, standings, and results using the Ergast Developer API.

## Features

- 🏎️ View upcoming race schedules with detailed session times
- 📊 Check current driver and constructor standings
- 🏁 Get race results
- ⏰ Set your timezone for accurate race times
- 🔔 Get race reminders
- 📱 View next race information
- 🔄 Fallback to alternative API for reliability

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Telegram Bot Token (get it from [@BotFather](https://t.me/botfather))

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd f1-fan-bot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```
   BOT_TOKEN=your_telegram_bot_token_here
   DATABASE_PATH=./data/f1bot.db
   NODE_ENV=development
   ```

4. Build the TypeScript code:

   ```bash
   npm run build
   ```

5. Start the bot:
   ```bash
   npm start
   ```

## Available Commands

- `/start` - Start the bot and see available commands
- `/schedule` - View upcoming race schedule with all sessions
- `/driverstandings` - See current driver championship standings
- `/constructorstandings` - See current constructor championship standings
- `/settimezone` - Set your timezone (e.g., `/settimezone Europe/London`)
- `/results` - Get the latest race results
- `/live` - Get information about the next upcoming race
- `/pitstops` - View last race results
- `/driver` - Search driver info by name or number (e.g., `/driver Hamilton` or `/driver 44`)
- `/apistatus` - View or change data source API

## Development

- Build the project:

  ```bash
  npm run build
  ```

- Run in development mode with auto-reload:

  ```bash
  npm run dev
  ```

- Watch for TypeScript changes:

  ```bash
  npm run watch
  ```

- Debug the application:

  ```bash
  npm run debug
  ```

- Start the application (includes build step):
  ```bash
  npm start
  ```

## Data Sources

The bot uses the following data sources:

1. Primary: **Ergast API** (ergast.com)
2. Fallback: **Jolpi.ca API** (api.jolpi.ca/ergast)

The bot automatically switches to the fallback API if the primary one fails, ensuring reliability and uptime.

## Data Updates

The bot automatically updates race data and standings every 6 hours. All data is cached in a local SQLite database for better performance and reliability. The bot focuses on the 2025 F1 season.

## API Status Commands

You can manage the API source with these commands:

- `/apistatus` - Show current API status
- `/apistatus alt` - Switch to the alternative API
- `/apistatus primary` - Switch to the primary API
- `/apistatus stats` - View API usage statistics

## Docker

You can run the bot using Docker for easier deployment:

1. Copy your environment variables to a `.env` file:

   ```
   BOT_TOKEN=your_telegram_bot_token_here
   DATABASE_PATH=./data/f1bot.db
   NODE_ENV=production
   ```

2. Build and run with Docker Compose:

   ```bash
   docker-compose up -d
   ```

3. Check logs:

   ```bash
   docker-compose logs -f
   ```

4. Stop the container:

   ```bash
   docker-compose down
   ```

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the ISC License.

## Acknowledgments

- [Ergast Developer API](http://ergast.com/mrd/) for Formula 1 data
- [Jolpi.ca API](https://api.jolpi.ca/ergast/) for alternative F1 data
- [Telegraf](https://github.com/telegraf/telegraf) for the Telegram Bot framework
