const { REST, Routes } = require('discord.js');

const { consoleLog, writeLogToFile } = require('../services/logger.js');

const deployCommands = async (commands, clearCommands = false) => {
    const rest = new REST().setToken(process.env.TOKEN);

    const isProduction = process.env.ENVIRONMENT === 'production';
    const devGuildId = process.env.DEV_GUILD_ID;

    try {
        const globalCommands = [];
        const commandsByGuild = new Map();

        const addGuildCommand = (guildId, commandJson) => {
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
                addGuildCommand(devGuildId, commandJson);

                if (isProduction) {
                    globalCommands.push(commandJson);
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

        if (isProduction) {
            const body = clearCommands ? [] : globalCommands;

            consoleLog(
                'system',
                clearCommands
                    ? 'Clearing global commands...'
                    : `Deploying ${globalCommands.length} global commands...`
            );

            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body }
            );

            consoleLog('system', `Successfully deployed ${data.length} global commands.`);
        }

        for (const [guildId, guildCommands] of commandsByGuild) {
            const body = clearCommands ? [] : guildCommands;

            consoleLog(
                'system',
                clearCommands
                    ? `Clearing commands for guild ${guildId}...`
                    : `Deploying ${guildCommands.length} commands to guild ${guildId}...`
            );

            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
                { body }
            );

            consoleLog('system', `Successfully deployed ${data.length} commands to guild ${guildId}.`);
        }
    } catch (error) {
        consoleLog('error', `Error deploying commands: ${error.stack || error}`);
        writeLogToFile('error', `Error deploying commands: ${error.stack || error}`);
        throw error;
    }
};

module.exports = deployCommands;