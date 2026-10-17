const LoggingSettingsRepository = require('../repositories/LoggingSettingsRepository.js');
const LoggingSettingsCache = require('../cache/LoggingSettingsCache.js');

const WatchDogSettingsRepository = require('../repositories/WatchDogSettingsRepository.js');
const WatchDogSettingsCache = require('../cache/WatchDogSettingsCache.js');

async function loadRepos(client) {
    // ! Logging Settings
    const loggingSettingsRepository = new LoggingSettingsRepository();
    client.loggingSettings = new LoggingSettingsCache(loggingSettingsRepository);
    await client.loggingSettings.initialize();

    // ! Watchdog Settings
    const watchDogSettingsRepository = new WatchDogSettingsRepository();
    client.watchDogSettings = new WatchDogSettingsCache(watchDogSettingsRepository);
    await client.watchDogSettings.initialize();
}

module.exports = { 
    loadRepos 
};
