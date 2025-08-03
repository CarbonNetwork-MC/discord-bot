const { Events, ActivityType } = require('discord.js');
const { consoleLog } = require('../src/logger.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute: (client) => {
        // ! Status
        const statuses = [
            { name: 'Joxy', type: ActivityType.Listening },
            { name: 'you', type: ActivityType.Watching },
            { name: 'Minecraft', type: ActivityType.Playing }
        ];

        let index = 0;
        let interval = 60; // Interval in seconds

        // Set the status
        setInterval(() => {
            consoleLog('system', `Setting status: ${statuses[index].name} (${statuses[index].type})`);
            client.user.setPresence({
                activities: [statuses[index]],
                status: 'dnd',
            });

            index = (index + 1) % statuses.length;
        }, 1000 * interval);

        consoleLog('system', 'Status has been set!');
        consoleLog('system', `Ready! Logged in as ${client.user.tag}`);
    }
}