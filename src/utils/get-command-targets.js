const { consoleLog, writeLogToFile } = require('../services/logger.js');

function getCommandTargets(commands) {
    const isProduction = process.env.ENVIRONMENT === 'production';
    const devGuildId = process.env.DEV_GUILD_ID;

    const globalCommands = [];
    const commandsByGuild = new Map();

    const addGuildCommand = (guildId, commandJson) => {
        if (!guildId) return;

        if (!commandsByGuild.has(guildId)) {
            commandsByGuild.set(guildId, []);
        }

        commandsByGuild.get(guildId).push(commandJson);
    };

    for (const command of commands) {
        if (!command.data) {
            consoleLog('warning', 'Skipping command without data property.');
            writeLogToFile('warning', 'Skipping command without data property.');
            continue;
        }

        const commandName = command.data.name;
        const commandJson = command.data.toJSON();

        const hasIsDev = Object.prototype.hasOwnProperty.call(command, 'isDev');
        const hasServers = Object.prototype.hasOwnProperty.call(command, 'servers');

        if (!hasIsDev || !hasServers) {
            consoleLog('warning', `Command ${commandName} is missing "isDev" or "servers" property. Skipping.`);
            writeLogToFile('warning', `Command ${commandName} is missing "isDev" or "servers" property. Skipping.`);
            continue;
        }

        if (typeof command.isDev !== 'boolean') {
            consoleLog('warning', `Command ${commandName} has invalid "isDev" property. Expected boolean.`);
            writeLogToFile('warning', `Command ${commandName} has invalid "isDev" property. Expected boolean.`);
            continue;
        }

        if (command.servers !== null && !Array.isArray(command.servers)) {
            consoleLog('warning', `Command ${commandName} has invalid "servers" property. Expected array or null.`);
            writeLogToFile('warning', `Command ${commandName} has invalid "servers" property. Expected array or null.`);
            continue;
        }

        if (command.isDev) {
            addGuildCommand(devGuildId, commandJson);
            continue;
        }

        if (command.servers === null) {
            if (isProduction) {
                globalCommands.push(commandJson);
            } else {
                addGuildCommand(devGuildId, commandJson);
            }

            continue;
        }

        const targetServers = isProduction
            ? command.servers
            : command.servers.filter(guildId => guildId === devGuildId);

        for (const guildId of targetServers) {
            addGuildCommand(guildId, commandJson);
        }
    }

    return {
        globalCommands,
        commandsByGuild,
    };
}

module.exports = { getCommandTargets };