const { Events, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const { consoleLog, writeLogToFile } = require('../services/logger.js');
const { startReminderChecker } = require('../jobs/checkReminders.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute: (client) => {
        // ! Status
        const filePath = path.join(__dirname, '../config/status.json');
        const statusJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        const statuses = statusJson.messages.map(status => ({
            name: status.name,
            type: ActivityType[status.type]
        }));

        let index = 0;
        let interval = 60; // Interval in seconds

        // Set the status
        if (statuses.length > 1) {
            setInterval(() => {
                client.user.setPresence({
                    activities: [statuses[index]],
                    status: statusJson.status,
                });

                index = (index + 1) % statuses.length;
            }, 1000 * interval);
        } else {
            client.user.setPresence({
                activities: [statuses[0]],
                status: statusJson.status,
            });
        }

        // ? Start jobs
        startReminderChecker(client);

        consoleLog('system', 'Status has been set!');
        consoleLog('system', `\x1b[32mReady! \x1b[1;36mLogged in as ${client.user.tag}\x1b[0m`);
        writeLogToFile('system', `Ready! Logged in as ${client.user.tag}`);
    }
}