const database = require('../services/database.js');

class LoggingSettingsRepository {
    constructor() {
        this.database = database.getDbPool();
    }

    async getAll() {
        const [rows] = await this.database.query(`
            SELECT *
            FROM dcb_logging_settings 
        `);

        return rows;
    }

    async getByGuildId(guildId) {
        const [rows] = await this.database.query(`
            SELECT *
            FROM dcb_logging_settings
            WHERE guild_id = $1
        `, [guildId]);

        return rows[0] ?? null;
    }

    async create(guildId) {
        const [rows] = await database.query(`
            INSERT INTO logging_settings (
                guild_id
            )
            VALUES ($1)
            RETURNING *
        `, [guildId]);

        return rows[0] ?? null;
    }

    async update(guildId, updates) {
        const keys = Object.keys(updates);

        const setClause = keys
            .map((key, index) => `${key} = $${index + 2}`)
            .join(', ');

        const values = Object.values(updates);

        const [rows] = await database.query(`
            UPDATE logging_settings
            SET ${setClause}
            WHERE guild_id = $1
            RETURNING *
        `, [guildId, ...values]);

        return rows[0] ?? null;
    }

    async delete(guildId) {
        await database.query(`
            DELETE FROM logging_settings
            WHERE guild_id = $1
        `, [guildId]);
    }
}

module.exports = LoggingSettingsRepository;
