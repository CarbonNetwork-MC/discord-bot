const { Events, ActivityType } = require('discord.js');
const { consoleLog, writeLogToFile } = require('../services/logger.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute: (client) => {
        // ! Status
        const statuses = [
            { name: 'Listening to Joxy', type: ActivityType.Listening },
            { name: 'Watching you', type: ActivityType.Watching },
            { name: 'Playing Minecraft', type: ActivityType.Playing }
        ];

        let index = 0;
        let interval = 60; // Interval in seconds

        // Set the status
        setInterval(() => {
            client.user.setPresence({
                activities: [statuses[index]],
                status: 'dnd',
            });

            index = (index + 1) % statuses.length;
        }, 1000 * interval);

        consoleLog('system', 'Status has been set!');
        consoleLog('system', `\x1b[32mReady! \x1b[1;36mLogged in as ${client.user.tag}\x1b[0m`);
        writeLogToFile('system', `Ready! Logged in as ${client.user.tag}`);
    }
}