const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    isDev: true,
    servers: null,
    allowedUsers: [
        process.env.OWNER_ID,
    ],
    requiredPermissions: null,
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Test command for owner only'),
    async execute(interaction) {
        // Implement your test command logic here

        interaction.reply({ content: 'Test command executed successfully.', flags: MessageFlags.Ephemeral });
    }
}