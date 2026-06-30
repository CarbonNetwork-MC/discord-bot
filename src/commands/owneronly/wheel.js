const { SlashCommandBuilder } = require('discord.js');

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
            return interaction.reply({ content: 'You are not allowed to use this command.', ephemeral: true });
        }

        const results = [
            'Cities Coding',
            'Cities Building',
            'Hub Coding',
            'Backoffice Coding',
            'discord.js Coding',
            'Essentials Coding'
        ];
        const randomResult = results[Math.floor(Math.random() * results.length)];
        await interaction.reply({ content: `The wheel landed on: **${randomResult}**`, ephemeral: true });
    }
}