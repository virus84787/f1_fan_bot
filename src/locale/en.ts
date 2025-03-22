export default {
    // Common
    welcome_message: 'Welcome to the F1 Fan Bot! Get the latest F1 info and set reminders.',
    thank_you: 'Thank you!',
    points: 'pts',

    // Menu command
    menu_opened: '🗂 Menu opened!',
    menu_closed: '🗂 Menu closed, use /menu to reopen it!',
    btn_exit: '❌ Exit',

    // Menus and navigation
    menu_back: '⬅️ Back',
    main_menu: 'Main Menu',
    back_to_main_menu: '⬅️ Back to Main Menu',
    back_to_reminders_menu: '⬅️ Back to Reminders Menu',
    back_to_standings_menu: '⬅️ Back to Standings Menu',
    back_to_schedule_menu: '⬅️ Back to Schedule Menu',
    back_to_results_menu: '⬅️ Back to Results Menu',
    standings_menu_title: '📊 Standings\n\nSelect the standings you want to view:',

    // Main menu buttons
    btn_schedule: '🏁 Schedule',
    btn_standings: '📊 Standings',
    btn_results: '🏎️ Results',
    btn_live: '⏱️ Live',
    btn_pit_stops: '🛑 Pit Stops',
    btn_reminders: '⏰ Reminders',
    btn_language_settings: '🌐 Language Settings',

    // Schedule menu
    schedule_menu_title: '🏁 F1 Schedule\n\nChoose an option:',
    btn_schedule_view: '🗓 View Schedule',

    // Results menu
    results_menu_title: '🏎️ F1 Results\n\nChoose an option:',
    btn_race_results: '🏁 Race Results',

    // Standings menu buttons
    btn_driver_standings: '🏆 Driver Standings',
    btn_constructor_standings: '🛠️ Constructor Standings',

    // Reminders menu buttons
    btn_add_reminder: '➕ Add New Reminder',
    btn_manage_reminders: '📋 Manage Reminders',

    // Language selection buttons
    btn_english: '🇬🇧 English',
    btn_ukrainian: '🇺🇦 Ukrainian',

    // No data messages
    no_upcoming_race: 'No upcoming races found.',
    no_live_race: 'No live races at the moment.',
    no_race_data: 'No race data available.',
    no_pitstop_data: 'No pit stop data available for the last race.',

    // Schedule
    schedule_title: '🏁 F1 Race Schedule',
    race_round: 'Round {round}: {raceName}',
    race_date: '📅 Date: {date}',
    race_time: '⏰ Time: {time}',
    race_location: '📍 Location: {location}',
    race_circuit: '🏎️ Circuit: {circuit}',

    // Driver Standings
    driver_standings_title: 'Current Driver Standings',

    // Constructor Standings
    constructor_standings_title: 'Current Constructor Standings',

    // Reminders
    reminder_menu_title: '⏰ Reminder Settings\n\nChoose what you would like to do:',
    reminder_title: '➕ Add New Reminder',
    reminder_explanation: 'Select a race to set a reminder:',
    reminder_options: 'When do you want to be reminded?',
    reminder_1h: '1 hour before',
    reminder_3h: '3 hours before',
    reminder_1d: '1 day before',
    reminder_time_1h: 'one hour',
    reminder_time_3h: 'three hours',
    reminder_time_1d: 'one day',
    reminder_set: 'Reminder for {race_name} is set. You will receive a notification {time_before} before the race starts.',
    reminder_delete: 'Reminder has been deleted.',
    reminder_none: 'You have no active reminders.',
    reminder_list_title: 'Your active reminders:',
    reminder_list_entry: '{race_name} - {reminder_time} before race',
    reminder_notification: '🏁 REMINDER: {race_name} is starting in {time_left}! 🏁\n\nLocation: {location}\nStart time: {race_time}',
    reminder_delete_instruction: 'Click on a reminder to delete it.',

    // Language
    language_title: 'Language Settings',
    language_current: 'Current language: {language}',
    language_set: 'Language has been set to English',
    language_options: 'Available languages:\n- English (/language_en)\n- Ukrainian (/language_uk)',
    language_invalid: 'Invalid language code. Available options:\n- English (/language_en)\n- Ukrainian (/language_uk)',

    // General errors
    error_general: 'Sorry, something went wrong. Please try again later.',
    error_schedule: 'Sorry, I couldn\'t retrieve the schedule right now. Please try again later.',
    error_driver_standings: 'Sorry, there was an error fetching the driver standings. Please try again later.',
    error_constructor_standings: 'Sorry, there was an error fetching the constructor standings. Please try again later.',
    error_timezone: 'Sorry, there was an error updating your timezone. Please try again later.',
    error_results: 'Sorry, there was an error fetching the race results. Please try again later.',
    error_live: 'Sorry, I couldn\'t retrieve live information right now. Please try again later.',
    error_pitstops: 'Sorry, I couldn\'t retrieve pit stop information right now. Please try again later.',
    error_driver_info: 'Sorry, I couldn\'t find information for that driver. Please try again or try a different driver.',
    error_reminder: 'Sorry, there was an error with your reminder. Please try again later.',

    // Schedule command
    upcoming_races: '🔜 Upcoming Races:',
    no_upcoming_races: '⚠️ No scheduled races left for this season.',
    schedule_not_released: '⚠️ The F1 schedule for {year} has not been released yet.',
    past_races: '📅 Recent Past Races:',
    no_past_races: '⚠️ No races have been held this season yet.',
    no_races: '❌ The race schedule for F1 {year} season is not available. Please try again later.',
    fp1: '🔹 FP1: {time}',
    fp2: '🔹 FP2: {time}',
    fp3: '🔹 FP3: {time}',
    sprint: '🔹 Sprint: {time}',
    qualifying: '🔹 Quali: {time}',

    // Driver standings
    driver_standings_entry: '{position}. {firstName} {lastName}\n   Points: {points} | Wins: {wins}\n   Team: {team}',
    driver_standing_entry: '{position}. {name} - {points} pts ({team})',

    // Constructor standings
    constructor_standings_entry: '{position}. {name}\n   Points: {points} | Wins: {wins}',

    // Set timezone
    timezone_invalid: 'Please provide a valid timezone. Example:\n/settimezone Europe/London\n\nFind your timezone here: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones',
    timezone_updated: 'Timezone successfully set to {timezone}',

    // Results
    results_title: '🏁 Results: {raceName} ({date}, {timezone})',
    results_entry: '{position}. {firstName} {lastName} - {constructor}\n   Time: {time}\n   Points: {points}',
    results_header: '🏁 Results: {raceName} ({date})',
    result_entry: '{position}. {name} - {team} - {time}',
    no_results: 'No race results found. Please try again later.',

    // Live
    next_race_title: '🏎️ Next Race: {raceName}',
    next_race_round: 'Round {round} of the {year} season',
    next_race_circuit: 'Circuit: {circuitName}',
    next_race_location: 'Location: {locality}, {country}',
    next_race_date: 'Date: {date} ({timezone})',
    countdown: 'Countdown: {days} days, {hours} hours, {minutes} minutes',

    // Pit stops
    pitstops_title: '🔧 Pit Stops - {raceName} ({date}, {timezone})',
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

    // Welcome message
    welcome: 'Welcome to F1 Fan Bot! 🏎️\n\n' +
        'Available commands:\n' +
        '/menu - Open the main menu\n' +
        '/schedule - View race schedule\n' +
        '/driverstandings - Current driver standings\n' +
        '/constructorstandings - Current constructor standings\n' +
        '/settimezone - Set your timezone\n' +
        '/remind - Set a race reminder\n' +
        '/live - Next race information\n' +
        '/pitstops - View last race pitstops\n' +
        '/driver - Driver info (example: /driver Hamilton)\n' +
        '/results - Last race results\n' +
        '/language - Language settings\n' +
        '/language_en - Switch to English\n' +
        '/language_uk - Switch to Ukrainian',
}; 