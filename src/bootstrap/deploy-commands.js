const { REST, Routes } = require('discord.js');

const { consoleLog, writeLogToFile } = require('../services/logger.js');

const deployCommands = async (commands, clearCommands = false) => {
    const rest = new REST().setToken(process.env.TOKEN);

    try {
        const isDev = process.env.ENVIRONMENT === 'development';

        const route = isDev
            ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID)
            : Routes.applicationCommands(process.env.CLIENT_ID);

        const body = clearCommands ? [] : commands;

        if (isDev) {
            consoleLog('warning', `\x1b[1;31mDiscord Bot is in development mode, commands will be deployed to the development server.\x1b[0m`);
            writeLogToFile('warning', 'Discord Bot is in development mode, commands will be deployed to the development server.');
        }

        consoleLog('system', clearCommands
            ? 'Clearing existing commands...'
            : `Deploying ${commands.length} commands...`
        );

        const data = await rest.put(route, { body });

        consoleLog('system', `Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        consoleLog('error', `Error deploying commands: ${error.stack || error}`);
        writeLogToFile('error', `Error deploying commands: ${error.stack || error}`);
        throw error;
    }
};

module.exports = deployCommands;