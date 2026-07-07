const { SlashCommandBuilder, EmbedBuilder, InteractionContextType, ApplicationIntegrationType } = require('discord.js');

module.exports = {
	isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!')
		.setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		]),
		
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('Random')
			.setDescription(`🏓 \`${Date.now() - interaction.createdTimestamp}\`ms`)
			.setFooter({ text: process.env.EMBED_FOOTER })
			.setTimestamp();

		await interaction.reply({ embeds: [embed] });
	},
};