export const uk = {
    welcome: 'Ласкаво просимо до F1 Fan Bot! 🏎️\n\n' +
        'Доступні команди:\n' +
        '/schedule - Переглянути розклад перегонів\n' +
        '/driverstandings - Поточні позиції пілотів\n' +
        '/constructorstandings - Поточні позиції конструкторів\n' +
        '/settimezone - Встановити часовий пояс\n' +
        '/remind - Встановити нагадування про перегони\n' +
        '/live - Отримати інформацію про наступні перегони\n' +
        '/pitstops - Переглянути результати останніх піт-стопів\n' +
        '/driver - Отримати інформацію про пілота (наприклад: /driver Hamilton)\n' +
        '/results - Отримати результати останніх перегонів\n' +
        '/apistatus - Перевірити або змінити джерело даних\n' +
        '/language - Змінити мову',

    // Schedule command
    schedule_title: '📅 Сезон F1 {year} - Розклад',
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
    driver_standings_title: '🏆 Поточні позиції пілотів:',
    driver_standings_entry: '{position}. {firstName} {lastName}\n   Очки: {points} | Перемоги: {wins}\n   Команда: {team}',

    // Constructor standings
    constructor_standings_title: '🏭 Поточні позиції конструкторів:',
    constructor_standings_entry: '{position}. {name}\n   Очки: {points} | Перемоги: {wins}',

    // Set timezone
    timezone_invalid: 'Будь ласка, вкажіть правильний часовий пояс. Приклад:\n/settimezone Europe/Kiev\n\nЗнайдіть свій часовий пояс тут: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones',
    timezone_updated: 'Часовий пояс успішно встановлено на {timezone}',

    // Results
    results_title: '🏁 Результати: {raceName} ({date})',
    results_entry: '{position}. {firstName} {lastName} - {constructor}\n   Час: {time}\n   Очки: {points}',
    no_results: 'Результати перегонів не знайдено. Спробуйте пізніше.',

    // Live
    next_race_title: '🏎️ Наступні перегони: {raceName}',
    next_race_round: 'Етап {round} сезону {year}',
    next_race_circuit: 'Трек: {circuitName}',
    next_race_location: 'Місце: {locality}, {country}',
    next_race_date: 'Дата: {date}',
    countdown: 'Зворотній відлік: {days} днів, {hours} годин, {minutes} хвилин',
    no_upcoming_race: 'Не знайдено майбутніх перегонів для цього сезону.',

    // Pit stops
    pitstops_title: '🔧 Піт-стопи - {raceName} ({date})',
    pitstops_entry: 'Круг {lap} - {firstName} {lastName}\n   Час: {duration} секунд',
    no_pitstops: 'Дані про піт-стопи для останніх перегонів недоступні.',

    // Driver info
    driver_info_title: 'Інформація про пілота: {firstName} {lastName}',
    driver_info_number: 'Номер: {number}',
    driver_info_team: 'Команда: {team}',
    driver_info_nationality: 'Національність: {nationality}',
    driver_info_dob: 'Дата народження: {dob}',
    driver_info_not_found: 'Пілота не знайдено. Спробуйте інше ім\'я або номер.',
    driver_info_usage: 'Будь ласка, вкажіть ім\'я пілота або номер. Приклад:\n/driver Hamilton\nабо\n/driver 44',

    // API status
    api_status: 'Поточне джерело API: {source}\nСтатус: {status}',
    api_switched: 'Джерело API змінено на: {source}',
    api_usage: 'Команди статусу API:\n/apistatus - Показати поточний статус\n/apistatus alt - Перейти на альтернативний API\n/apistatus primary - Перейти на основний API\n/apistatus stats - Показати статистику API',
    api_stats: 'Статистика API:\nВиклики основного API: {primaryCalls}\nВиклики резервного API: {fallbackCalls}\nНевдалі запити: {failedCalls}',

    // Language
    language_title: 'Налаштування мови',
    language_current: 'Поточна мова: {language}',
    language_set: 'Мову встановлено на українську',
    language_options: 'Доступні мови:\n- Англійська (/language en)\n- Українська (/language uk)',
    language_invalid: 'Неправильний код мови. Доступні варіанти:\n- Англійська (/language en)\n- Українська (/language uk)',

    // General errors
    error_general: 'На жаль, сталася помилка. Спробуйте пізніше.',
    error_schedule: 'На жаль, виникла помилка при отриманні розкладу. Спробуйте пізніше.',
    error_driver_standings: 'На жаль, виникла помилка при отриманні позицій пілотів. Спробуйте пізніше.',
    error_constructor_standings: 'На жаль, виникла помилка при отриманні позицій конструкторів. Спробуйте пізніше.',
    error_timezone: 'На жаль, виникла помилка при встановленні часового поясу. Спробуйте пізніше.',
    error_results: 'На жаль, виникла помилка при отриманні результатів перегонів. Спробуйте пізніше.',
    error_live: 'На жаль, виникла помилка при отриманні інформації про наступні перегони. Спробуйте пізніше.',
    error_pitstops: 'На жаль, виникла помилка при отриманні даних про піт-стопи. Спробуйте пізніше.',
    error_driver_info: 'На жаль, виникла помилка при отриманні інформації про пілота. Спробуйте пізніше.',
}; 