const reminderTimers = require('../services/reminderTimers.js');
const { consoleLog, writeLogToFile } = require('../services/logger.js');
const ReminderRepository = require('../repositories/RemindersRepository.js');

function startReminderChecker(client) {
    setInterval(async () => {
        const upcomingReminders = await ReminderRepository.getUpcomingReminders(3);

        for (const reminder of upcomingReminders) {
            reminderTimers.scheduleReminder(client, reminder);
        }
    }, 60_000);
}

module.exports = {
    startReminderChecker,
}
