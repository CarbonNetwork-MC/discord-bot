const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
	isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

	data: new SlashCommandBuilder()
		.setName('replace')
		.setDescription('Replace text in a message')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The text which you want to replace in')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('find')
                .setDescription('The text which you want to find')
                .setRequired(true)
        ),

	async execute(interaction) {
        const input = interaction.options.getString('input');
        const find = interaction.options.getString('find');

        const replacedText = input.replace(new RegExp(find, 'g'), '');

        const embed = new EmbedBuilder()
            .setTitle('Text Replacement Result')
            .setDescription(`**Original Text:** ${input}\n**Replaced Text:** ${replacedText}`)
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        await interaction.reply({ 
            embeds: [embed]
        });
	},
};