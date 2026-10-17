const database = require('../services/database.js');

class WatchDogSettingsRepository {
    constructor() {
        this.database = database.getDbPool();
    }

    async getAll() {
        const [rows] = await this.database.query(`
            SELECT *
            FROM dcb_watchdog_settings 
        `);

        return rows;
    }

    async getByGuildId(guildId) {
        const [rows] = await this.database.query(`
            SELECT *
            FROM dcb_watchdog_settings
            WHERE guild_id = $1
        `, [guildId]);

        return rows[0] ?? null;
    }
}

module.exports = WatchDogSettingsRepository;
