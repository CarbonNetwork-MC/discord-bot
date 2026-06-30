const database = require('../services/database.js');
const deployCommands = require('./deploy-commands.js');
const { loadCommands } = require('./load-commands.js');
const { loadEvents } = require('./load-events.js');
const { loadGuildSettings } = require('../config/guild-settings.js');
const { consoleLog, writeLogToFile } = require('../services/logger.js');

async function bootstrap(client) {
    consoleLog('system', 'Starting bot bootstrap');

    const pool = await database.initDbPool(5, 1000);

    if (pool) {
        await loadGuildSettings();
    }

    const commands = loadCommands(client);

    loadEvents(client);

    await deployCommands(commands, false);

    await client.login(process.env.TOKEN);

    consoleLog('system', 'Bot bootstrap finished');
}

module.exports = { bootstrap };