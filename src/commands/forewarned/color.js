const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,
    data: new SlashCommandBuilder()
        .setName('color')
        .setDescription('Generates three random numbers between 0 and 255 to create a random color.'),

    async execute(interaction) {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);

        const embed = new EmbedBuilder()
            .setTitle('Random Color')
            .setDescription(`RGB: (${r}, ${g}, ${b})\nHex: #${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`)
            .setColor((r << 16) + (g << 8) + b);

        await interaction.reply({ embeds: [embed] });
    }
}