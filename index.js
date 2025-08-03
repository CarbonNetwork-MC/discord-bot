require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const deployCommands = require('./src/deploy-commands');
const { consoleLog } = require('./src/logger.js');
const { loadGuildSettings } = require('./src/guild-settings');
const database = require('./src/database.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
});

client.commands = new Collection();

// Load commands from the commands directory
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
			consoleLog('warning', `The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Load event handlers from the events directory
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

/*
 * Initialize the database pool
 * Load the guild settings
 * Deploy Commands
 * Login the client
*/
(async () => {
    // Initialize DB pool first
    const pool = await database.initDbPool(5, 2000); // 5 retries, 2s delay

    if (pool) {
        try {
            await loadGuildSettings();
        } catch (err) {
            consoleLog('error', `Failed to load guild settings: ${err.message}`);
        }
    } else {
        consoleLog('error', 'Guild settings not loaded because database pool could not be initialized.');
    }

    // Deploy commands and login after DB + settings
    await deployCommands(client);
    client.login(process.env.TOKEN);
})();