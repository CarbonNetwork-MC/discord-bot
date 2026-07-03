const { consoleLog, writeLogToFile } = require('../services/logger.js');

class LoggingSettingsCache {
    constructor(repository) {
        this.repository = repository;
        this.cache = new Map();
    }

    async initialize() {
        const settings = await this.repository.getAll();

        // console.log(settings);

        if (!settings || settings.length === 0) {
            consoleLog('error', 'No logging settings found in the database.');
            writeLogToFile('error', 'No logging settings found in the database.');
            return;
        }

        for (const setting of settings) {
            this.cache.set(setting.guild_id, setting);
        }
    }

    get(guildId) {
        return this.cache.get(guildId);
    }

    getKeys() {
        return Array.from(this.cache.keys());
    }

    isEnabled(guildId, eventName) {
        const settings = this.cache.get(guildId);
        if (!settings) return false;

        return settings[eventName] ?? false;
    }

    async refresh(guildId) {
        const settings = await this.repository.getByGuildId(guildId);
        
        if (settings) {
            this.cache.set(guildId, settings);
        }

        return settings;
    }

    async update(guildId, data) {
        const settings = await this.repository.update(guildId, data);

        this.cache.set(guildId, settings);

        return settings;
    }

    delete(guildId) {
        this.cache.delete(guildId);
    }
}

module.exports = LoggingSettingsCache;
