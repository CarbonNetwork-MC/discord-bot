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
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildModeration,
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
function getFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    return entries.flatMap(entry => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            return getFiles(fullPath);
        }

        return entry.name.endsWith('.js') ? [fullPath] : [];
    });
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = getFiles(eventsPath);

for (const filePath of eventFiles) {
    const event = require(filePath);

    const runEvent = async (...args) => {
        try {
            await event.execute(...args);
        } catch (err) {
            consoleLog('error', `Error in event ${event.name}: ${err}`);
        }
    };

    if (event.once) {
        client.once(event.name, runEvent);
    } else {
        client.on(event.name, runEvent);
    }

    // # Debugging: Log the loaded event handler
    // consoleLog('system', `Loaded event handler: ${event.name} from ${filePath}`);
}

consoleLog('system', `Successfully loaded ${eventFiles.length} event handlers.`);

/*
 * Initialize the database pool
 * Load the guild settings
 * Deploy Commands
 * Login the client
*/
(async () => {
    consoleLog('system', 'Starting bot bootstrap');

    const pool = await database.initDbPool(5, 1000);
    consoleLog('system', 'initDbPool finished');

    if (pool) {
        consoleLog('system', 'Calling loadGuildSettings');
        await loadGuildSettings();
    }

    consoleLog('system', 'Deploying commands');
    await deployCommands(client, false);

    consoleLog('system', 'Logging in');
    await client.login(process.env.TOKEN);
})();