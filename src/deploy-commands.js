const { REST, Routes } = require('discord.js');

const fs = require('node:fs');
const path = require('node:path');

const { consoleLog } = require('./logger.js');

const deployCommands = async (client) => {
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

        // Global Commands
        // const data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

        // Development Server Commands
        const data = await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID), { body: commands });

        consoleLog('system', `Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
};

module.exports = deployCommands;