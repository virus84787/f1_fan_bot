export const uk = {
    welcome: 'Вітаємо у F1 Fan Bot! 🏎️\n\n' +
        'Доступні команди:\n' +
        '/menu - Відкрити головне меню\n' +
        '/schedule - Переглянути розклад перегонів\n' +
        '/driverstandings - Поточні позиції пілотів\n' +
        '/constructorstandings - Поточні позиції конструкторів\n' +
        '/settimezone - Встановити часовий пояс\n' +
        '/remind - Встановити нагадування\n' +
        '/live - Інформація про наступні перегони\n' +
        '/pitstops - Переглянути результати останніх перегонів\n' +
        '/driver - Інформація про пілота (наприклад: /driver Hamilton)\n' +
        '/results - Результати останніх перегонів\n' +
        '/language - Налаштування мови\n' +
        '/language_en - Перейти на англійську\n' +
        '/language_uk - Перейти на українську',

    // Menu command
    menu_opened: '🗂 Меню відкрито!',
    menu_closed: '🗂 Меню закрито, використовуйте /menu щоб відкрити його знову!',
    btn_exit: '❌ Вихід',

    // Menus and navigation
    menu_back: '⬅️ Назад',
    main_menu: 'Головне меню',
    back_to_main_menu: '⬅️ Повернутися до головного меню',
    back_to_reminders_menu: '⬅️ Повернутися до меню нагадувань',
    back_to_standings_menu: '⬅️ Повернутися до меню турнірних таблиць',
    back_to_schedule_menu: '⬅️ Повернутися до меню розкладу',
    back_to_results_menu: '⬅️ Повернутися до меню результатів',

    // Main menu buttons
    btn_schedule: '🏁 Розклад',
    btn_standings: '📊 Турнірні таблиці',
    btn_results: '🏎️ Результати',
    btn_live: '⏱️ Наживо',
    btn_pit_stops: '🛑 Піт-стопи',
    btn_reminders: '⏰ Нагадування',
    btn_language_settings: '🌐 Налаштування мови',

    // Schedule menu
    schedule_menu_title: '🏁 Розклад F1\n\nВиберіть опцію:',
    btn_schedule_view: '🗓 Переглянути розклад',

    // Results menu
    results_menu_title: '🏎️ Результати F1\n\nВиберіть опцію:',
    btn_race_results: '🏁 Результати гонки',

    // Standings menu buttons
    btn_driver_standings: '🏆 Залік пілотів',
    btn_constructor_standings: '🛠️ Залік конструкторів',

    // Reminders menu buttons
    btn_add_reminder: '➕ Додати нове нагадування',
    btn_manage_reminders: '📋 Керувати нагадуваннями',

    // Language selection buttons
    btn_english: '🇬🇧 Англійська',
    btn_ukrainian: '🇺🇦 Українська',

    // Schedule command
    schedule_title: '🏁 Сезон F1 {year} - Розклад',
    upcoming_races: '🔜 Майбутні перегони:',
    no_upcoming_races: '⚠️ Немає запланованих перегонів до кінця сезону.',
    schedule_not_released: '⚠️ Розклад F1 на {year} рік ще не опубліковано.',
    past_races: '📅 Нещодавні перегони:',
    no_past_races: '⚠️ В цьому сезоні ще не було перегонів.',
    no_races: '❌ Розклад перегонів для сезону F1 {year} недоступний. Спробуйте пізніше.',
    race_round: '🏁 Етап {round}: {raceName}',
    race_location: '📍 {locality}, {country}',
    race_circuit: '🏎️ {circuitName}',
    race_time: '⏰ {date} {timezone}',
    fp1: '🔹 Перше тренування: {time}',
    fp2: '🔹 Друге тренування: {time}',
    fp3: '🔹 Третє тренування: {time}',
    sprint: '🔹 Спринт: {time}',
    qualifying: '🔹 Кваліфікація: {time}',

    // Driver standings
    driver_standings_header: '🏆 Поточні позиції пілотів:',
    driver_standings_entry: '{position}. {firstName} {lastName}\n   Очки: {points} | Перемоги: {wins}\n   Команда: {team}',
    driver_standing_entry: '{position}. {name} - {team} ({points} очки)',

    // Constructor standings
    constructor_standings_header: '🏭 Поточні позиції конструкторів:',
    constructor_standings_entry: '{position}. {name}\n   Очки: {points} | Перемоги: {wins}',
    constructor_standing_entry: '{position}. {name} ({points} очки)',

    // Set timezone
    timezone_invalid: 'Будь ласка, вкажіть правильний часовий пояс. Приклад:\n/settimezone Europe/Kiev\n\nЗнайдіть свій часовий пояс тут: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones',
    timezone_updated: 'Часовий пояс успішно встановлено на {timezone}',

    // Results
    results_title: '🏁 Результати: {raceName} ({date}, {timezone})',
    results_entry: '{position}. {firstName} {lastName} - {constructor}\n   Час: {time}\n   Очки: {points}',
    results_header: '🏁 Результати: {raceName} ({date})',
    result_entry: '{position}. {name} - {team} - {time}',
    no_results: 'Результати перегонів не знайдено. Спробуйте пізніше.',

    // Live
    next_race_title: '🏎️ Наступні перегони: {raceName}',
    next_race_round: 'Етап {round} сезону {year}',
    next_race_circuit: 'Трек: {circuitName}',
    next_race_location: 'Місце: {locality}, {country}',
    next_race_date: 'Дата: {date} ({timezone})',
    countdown: 'Зворотній відлік: {days} днів, {hours} годин, {minutes} хвилин',
    no_upcoming_race: 'Не знайдено майбутніх перегонів для цього сезону.',

    // Pit stops
    pitstops_title: '🔧 Піт-стопи - {raceName} ({date}, {timezone})',
    pitstops_entry: 'Коло {lap} - {firstName} {lastName}\n   Час: {duration} секунд',
    no_pitstops: 'Дані про піт-стопи для останньої гонки відсутні.',

    // Driver info
    driver_info_title: 'Інформація про пілота: {firstName} {lastName}',
    driver_info_number: 'Номер: {number}',
    driver_info_team: 'Команда: {team}',
    driver_info_nationality: 'Національність: {nationality}',
    driver_info_dob: 'Дата народження: {dob}',
    driver_info_not_found: 'Пілота не знайдено. Спробуйте інше ім\'я або номер.',
    driver_info_usage: 'Будь ласка, вкажіть ім\'я пілота або номер. Приклад:\n/driver Hamilton\nабо\n/driver 44',

    // Reminders
    reminder_menu_title: '⏰ Налаштування нагадувань\n\nВиберіть, що ви хочете зробити:',
    reminder_title: '➕ Додати нове нагадування',
    reminder_explanation: 'Виберіть, коли ви хочете отримувати нагадування про перегони:',
    reminder_options: 'Коли ви хочете отримати нагадування?',
    reminder_1h: 'За 1 годину',
    reminder_3h: 'За 3 години',
    reminder_1d: 'За 1 день',
    reminder_time_1h: 'одну годину',
    reminder_time_3h: 'три години',
    reminder_time_1d: 'один день',
    reminder_set: 'Нагадування для {race_name} встановлено. Ви отримаєте сповіщення за {time_before} до початку перегонів.',
    reminder_delete: 'Нагадування видалено.',
    reminder_none: 'У вас немає активних нагадувань.',
    reminder_list_title: 'Ваші активні нагадування:',
    reminder_list_entry: '{race_name} - за {reminder_time} до перегонів',
    reminder_notification: '🏁 НАГАДУВАННЯ: {race_name} починається через {time_left}! 🏁\n\nМісце: {location}\nЧас початку: {race_time}',
    reminder_delete_instruction: 'Натисніть на нагадування, щоб видалити його.',
    reminder_invalid: 'Неправильний формат нагадування. Будь ласка, використовуйте /remind для встановлення нагадування.',
    reminder_usage: 'Використовуйте /remind для перегляду майбутніх перегонів та встановлення нагадувань.',

    // Language
    language_title: 'Налаштування мови',
    language_current: 'Поточна мова: {language}',
    language_set: 'Мову встановлено на українську',
    language_options: 'Доступні мови:\n- Англійська (/language_en)\n- Українська (/language_uk)',
    language_invalid: 'Неправильний код мови. Доступні варіанти:\n- Англійська (/language_en)\n- Українська (/language_uk)',

    // General errors
    error_general: 'На жаль, сталася помилка. Спробуйте пізніше.',
    error_schedule: 'На жаль, не вдалося отримати розклад. Спробуйте пізніше.',
    error_driver_standings: 'На жаль, виникла помилка при отриманні позицій пілотів. Спробуйте пізніше.',
    error_constructor_standings: 'На жаль, виникла помилка при отриманні позицій конструкторів. Спробуйте пізніше.',
    error_timezone: 'На жаль, сталася помилка при оновленні часового поясу. Спробуйте пізніше.',
    error_results: 'На жаль, виникла помилка при отриманні результатів перегонів. Спробуйте пізніше.',
    error_live: 'На жаль, не вдалося отримати інформацію про наступну гонку. Спробуйте пізніше.',
    error_pitstops: 'На жаль, не вдалося отримати дані про піт-стопи. Спробуйте пізніше.',
    error_driver_info: 'На жаль, не вдалося знайти інформацію про цього пілота. Спробуйте іншого.',
    error_reminder: 'На жаль, сталася помилка при обробці нагадування. Спробуйте пізніше.',

    // Standings menu
    standings_menu_title: '📊 Турнірні таблиці\n\nВиберіть, яку таблицю ви хочете переглянути:',
    driver_standings_title: 'Поточний залік пілотів',
    constructor_standings_title: 'Поточний залік конструкторів',
    points: 'очок',
}; 