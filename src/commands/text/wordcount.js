const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,
    data: new SlashCommandBuilder()
        .setName('wordcount')
        .setDescription('Get the word count of a text string')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The text to count words in')
                .setRequired(true)
        ),
    async execute(interaction) {
        const input = interaction.options.getString('input');
        const wordCount = input.trim().split(/\s+/).filter(word => word.length > 0).length;
        const embed = new EmbedBuilder()
            .setTitle('📄 Word Count')
            .setDescription(`The text contains **${wordCount}** words.`)
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
}
