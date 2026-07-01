const { REST, Routes } = require('discord.js');

const { consoleLog, writeLogToFile } = require('../services/logger.js');
const { getCommandTargets } = require('../utils/get-command-targets.js');

const deployCommands = async (commands, clearCommands = false) => {
    const rest = new REST().setToken(process.env.TOKEN);
    const isProduction = process.env.ENVIRONMENT === 'production';

    try {
        const { globalCommands, commandsByGuild } = getCommandTargets(commands);

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