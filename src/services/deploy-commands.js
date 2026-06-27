const { REST, Routes } = require('discord.js');

const fs = require('node:fs');
const path = require('node:path');

const { consoleLog } = require('./logger.js');

const deployCommands = async (client, clearCommands = false) => {
    const commands = [];
    const foldersPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                client.commands.set(command.data.name, command);
            } else {
                consoleLog('warning', `The command at ${filePath} is missing a required "data" or "execute" property.`)
            }
        }
    }

    const rest = new REST().setToken(process.env.TOKEN);

    try {
        consoleLog('system', `Started refreshing ${commands.length} application (/) commands.`);

        const isDev = process.env.ENVIRONMENT === 'development';
        const route = isDev
            ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID)
            : Routes.applicationCommands(process.env.CLIENT_ID);

        if (isDev) consoleLog('warning', `\x1b[1;31mDiscord Bot is in development mode, commands will be deployed to the development server.\x1b[0m`);

        if (clearCommands) {
            consoleLog('system', 'Clearing existing commands...');
        } else {
            consoleLog('system', isDev ? 'Deploying commands to development server...' : 'Deploying commands to production...');
        }

        const body = clearCommands ? [] : commands;
        const data = await rest.put(route, { body });

        consoleLog('system', `Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
};

module.exports = deployCommands;