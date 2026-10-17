const database = require('../services/database.js');

class RemindersRepository {
    constructor() {
        this.database = database.getDbPool();
    }

    async create(reminder) {
        const { userId, guildId, channelId, message, displayOption, remindAt } = reminder;

        const [result] = await this.database.query(`
            INSERT INTO dcb_reminders (
                user_id,
                guild_id,
                channel_id,
                message,
                display_option,
                remind_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, guildId, channelId, message, displayOption, remindAt]);

        const [rows] = await this.database.query(`
            SELECT *
            FROM dcb_reminders
            WHERE id = ?
        `, [result.insertId]);

        return rows[0] ?? null;
    }

    async getDueReminders() {
        const [rows] = await this.database.query(`
            SELECT *
            FROM dcb_reminders
            WHERE remind_at <= NOW() AND completed_at IS NULL
        `);
        return rows;
    }

    async getUpcomingReminders(minutesAhead) {
        const [rows] = await this.database.query(`
            SELECT *
            FROM dcb_reminders
            WHERE remind_at > NOW() AND remind_at <= NOW() + INTERVAL ? MINUTE AND completed_at IS NULL
        `, [minutesAhead]);
        return rows;
    }

    async markCompleted(reminderId) {
        const [rows] = await this.database.query(`
            UPDATE dcb_reminders
            SET completed_at = NOW()
            WHERE id = ?
        `, [reminderId]);

        return rows[0] ?? null;
    }
}

module.exports = new RemindersRepository();