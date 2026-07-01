const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,
    data: new SlashCommandBuilder()
        .setName('reverse')
        .setDescription('Reverse a text string')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The text to reverse')
                .setRequired(true)),
    async execute(interaction) {
        const input = interaction.options.getString('input');
        const reversed = input.split('').reverse().join('');
        const embed = new EmbedBuilder()
            .setTitle(':arrows_counterclockwise: Text Reversal')
            .setDescription(`The reversed text is:\n\`${reversed}\``)
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
}
