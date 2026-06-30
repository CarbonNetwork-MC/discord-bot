const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	isDev: false,
    servers: null,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('Random')
			.setDescription(`🏓 \`${Date.now() - interaction.createdTimestamp}\`ms`)
			.setFooter({ text: process.env.EMBED_FOOTER })
			.setTimestamp();

		await interaction.reply({ embeds: [embed] });
	},
};