const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,
    data: new SlashCommandBuilder()
        .setName('length')
        .setDescription('Get the length of a text string')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The text to measure')
                .setRequired(true)),
    async execute(interaction) {
        const input = interaction.options.getString('input');
        const embed = new EmbedBuilder()
            .setTitle('📄 Text Length')
            .addFields(
                {
                    name: 'Input Text',
                    value: input.length > 1024 ? input.slice(0, 1021) + '...' : input,
                    inline: false
                },
                {
                    name: 'Length',
                    value: `${input.length}`,
                    inline: false
                }
            )
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}