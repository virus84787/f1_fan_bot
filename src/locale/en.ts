export const en = {
    welcome: 'Welcome to F1 Fan Bot! 🏎️\n\n' +
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
        '/apistatus - Check or change data source\n' +
        '/language - Change language',

    // Schedule command
    schedule_title: '📅 F1 {year} Season Schedule',
    upcoming_races: '🔜 Upcoming Races:',
    no_upcoming_races: '⚠️ No upcoming races scheduled for the rest of the season.',
    schedule_not_released: '⚠️ The {year} F1 schedule has not been released yet.',
    past_races: '📅 Recent Past Races:',
    no_past_races: '⚠️ No races have taken place this season yet.',
    no_races: '❌ No race schedule available for the {year} F1 season. Please try again later.',
    race_round: '🏁 Round {round}: {raceName}',
    race_location: '📍 {locality}, {country}',
    race_circuit: '🏎️ {circuitName}',
    race_time: '⏰ {date} {timezone}',
    fp1: '🔹 FP1: {time}',
    fp2: '🔹 FP2: {time}',
    fp3: '🔹 FP3: {time}',
    sprint: '🔹 Sprint: {time}',
    qualifying: '🔹 Quali: {time}',

    // Driver standings
    driver_standings_title: '🏆 Current Driver Standings:',
    driver_standings_entry: '{position}. {firstName} {lastName}\n   Points: {points} | Wins: {wins}\n   Team: {team}',

    // Constructor standings
    constructor_standings_title: '🏭 Current Constructor Standings:',
    constructor_standings_entry: '{position}. {name}\n   Points: {points} | Wins: {wins}',

    // Set timezone
    timezone_invalid: 'Please provide a valid timezone. Example:\n/settimezone Europe/London\n\nFind your timezone here: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones',
    timezone_updated: 'Timezone successfully set to {timezone}',

    // Results
    results_title: '🏁 Results: {raceName} ({date})',
    results_entry: '{position}. {firstName} {lastName} - {constructor}\n   Time: {time}\n   Points: {points}',
    no_results: 'No race results found. Please try again later.',

    // Live
    next_race_title: '🏎️ Next Race: {raceName}',
    next_race_round: 'Round {round} of the {year} season',
    next_race_circuit: 'Circuit: {circuitName}',
    next_race_location: 'Location: {locality}, {country}',
    next_race_date: 'Date: {date}',
    countdown: 'Countdown: {days} days, {hours} hours, {minutes} minutes',
    no_upcoming_race: 'No upcoming races found for this season.',

    // Pit stops
    pitstops_title: '🔧 Pit Stops - {raceName} ({date})',
    pitstops_entry: 'Lap {lap} - {firstName} {lastName}\n   Time: {duration} seconds',
    no_pitstops: 'No pit stop data available for the last race.',

    // Driver info
    driver_info_title: 'Driver Information: {firstName} {lastName}',
    driver_info_number: 'Number: {number}',
    driver_info_team: 'Team: {team}',
    driver_info_nationality: 'Nationality: {nationality}',
    driver_info_dob: 'Date of Birth: {dob}',
    driver_info_not_found: 'Driver not found. Please try another name or number.',
    driver_info_usage: 'Please specify a driver name or number. Example:\n/driver Hamilton\nor\n/driver 44',

    // API status
    api_status: 'Current API Source: {source}\nStatus: {status}',
    api_switched: 'API source switched to: {source}',
    api_usage: 'API Status Commands:\n/apistatus - Show current status\n/apistatus alt - Switch to alternative API\n/apistatus primary - Switch to primary API\n/apistatus stats - Show API statistics',
    api_stats: 'API Statistics:\nPrimary API calls: {primaryCalls}\nFallback API calls: {fallbackCalls}\nFailed calls: {failedCalls}',

    // Language
    language_title: 'Language Settings',
    language_current: 'Current language: {language}',
    language_set: 'Language has been set to English',
    language_options: 'Available languages:\n- English (/language en)\n- Ukrainian (/language uk)',
    language_invalid: 'Invalid language code. Available options:\n- English (/language en)\n- Ukrainian (/language uk)',

    // General errors
    error_general: 'Sorry, an error occurred. Please try again later.',
    error_schedule: 'Sorry, there was an error fetching the schedule. Please try again later.',
    error_driver_standings: 'Sorry, there was an error fetching the driver standings. Please try again later.',
    error_constructor_standings: 'Sorry, there was an error fetching the constructor standings. Please try again later.',
    error_timezone: 'Sorry, there was an error setting your timezone. Please try again later.',
    error_results: 'Sorry, there was an error fetching the race results. Please try again later.',
    error_live: 'Sorry, there was an error fetching the next race information. Please try again later.',
    error_pitstops: 'Sorry, there was an error fetching the pit stop data. Please try again later.',
    error_driver_info: 'Sorry, there was an error fetching the driver information. Please try again later.',
}; 