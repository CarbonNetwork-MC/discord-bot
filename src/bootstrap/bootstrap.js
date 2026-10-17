const database = require('../services/database.js');
const deployCommands = require('./deploy-commands.js');
const { loadCommands } = require('./load-commands.js');
const { loadEvents } = require('./load-events.js');
const { loadRepos } = require('./load-repos.js');
const { loadGuildSettings } = require('../services/guild-settings.js');
const { consoleLog, writeLogToFile } = require('../services/logger.js');

async function bootstrap(client) {
    consoleLog('system', 'Starting bot bootstrap');

    // ? Database initialization
    const pool = await database.initDbPool(5, 1000);

    if (pool) {
        await loadGuildSettings();
    }

    // ? Intialize repositories and caches
    await loadRepos(client);

    // ? Load commands and events
    const commands = loadCommands(client);
    
    loadEvents(client);

    if (process.env.DEPLOY_COMMANDS === 'true') {
        await deployCommands(commands, process.env.CLEAR_COMMANDS === 'true');
    }

    await client.login(process.env.TOKEN);

    consoleLog('system', 'Bot bootstrap finished');
}

module.exports = { bootstrap };