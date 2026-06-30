const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const { getDbPool } = require('../../services/database.js');

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: [
        process.env.OWNER_ID,
    ],
    requiredPermissions: null,
    data: new SlashCommandBuilder()
        .setName('wheel')
        .setDescription('Spins the wheel and returns a random result'),
    async execute(interaction) {
        // Check if the command was used by a specific user
        if (interaction.user.id !== process.env.OWNER_ID) {
            return interaction.reply({ content: 'You are not allowed to use this command.', flags: MessageFlags.Ephemeral });
        }

        const db = getDbPool();

        const [rows] = await db.query('SELECT * FROM dcb_wheel_options WHERE is_active = 1');
        if (rows.length === 0) {
            return interaction.reply({ content: 'No options found in the wheel.', flags: MessageFlags.Ephemeral });
        }

        const randomResult = rows[Math.floor(Math.random() * rows.length)];
        await interaction.reply({ content: `The wheel landed on: **${randomResult.name}**`, flags: MessageFlags.Ephemeral });
    }
}