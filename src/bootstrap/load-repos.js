const LoggingSettingsRepository = require('../repositories/LoggingSettingsRepository.js');
const LoggingSettingsCache = require('../cache/LoggingSettingsCache.js');

async function loadRepos(client) {
    // ! Logging Settings
    const loggingSettingsRepository = new LoggingSettingsRepository();
    client.loggingSettings = new LoggingSettingsCache(loggingSettingsRepository);
    await client.loggingSettings.initialize();
}

module.exports = { 
    loadRepos 
};
