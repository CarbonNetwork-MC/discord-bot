const { consoleLog, writeLogToFile } = require('../services/logger.js');

class WatchDogSettingsCache {
    constructor(repository) {
        this.repository = repository;
        this.cache = new Map();
    }

    async initialize() {
        const settings = await this.repository.getAll();

        if (!settings || settings.length === 0) {
            consoleLog('error', 'No watchdog settings found in the database.');
            writeLogToFile('error', 'No watchdog settings found in the database.');
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

    getEnabledGuilds() {
        return Array.from(this.cache.entries())
            .filter(([_, settings]) => settings.enabled === 1)
            .map(([guildId, _]) => guildId);
    }

    isGuildEnabled(guildId) {
        const settings = this.cache.get(guildId);
        if (!settings) return false;

        return settings.enabled === 1;
    }

    isEnabled(guildId, eventName) {
        const settings = this.cache.get(guildId);
        if (!settings) return false;

        return settings[eventName] === 1;
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

module.exports = WatchDogSettingsCache;
