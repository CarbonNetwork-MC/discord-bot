const fs = require('node:fs');
const path = require('node:path');

const { consoleLog, writeLogToFile } = require('../services/logger.js');

const foldersToSkip = ['subcommands', 'src'];

function getCommandFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    return entries.flatMap(entry => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // Skip certain folders (e.g., "subcommands" and "src") when searching for command files
            if (foldersToSkip.includes(entry.name)) {
                return [];
            }

            return getCommandFiles(fullPath);
        }

        return entry.name.endsWith('.js') ? [fullPath] : [];
    });
}

function loadCommands(client, systemMessage = true) {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = getCommandFiles(commandsPath);

    const commands = [];

    for (const filePath of commandFiles) {
        const command = require(filePath);

        if (!command.data || !command.execute) {
            consoleLog('warning', `The command at ${filePath} is missing a required "data" or "execute" property.`);
            writeLogToFile('warning', `The command at ${filePath} is missing a required "data" or "execute" property.`);
            continue;
        }

        client.commands.set(command.data.name, command);
        commands.push(command);
    }

    if (systemMessage) {
        consoleLog('system', `Successfully loaded ${client.commands.size} commands.`);
    }

    return commands;
}

module.exports = { loadCommands };
