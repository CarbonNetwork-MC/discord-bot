const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    InteractionContextType, 
    ApplicationIntegrationType 
} = require('discord.js');

module.exports = {
	isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Provides information about the bot and its commands.')
		.setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		]),
		
	async execute(interaction) {
        await interaction.reply({
            content: 'No',
        })
	},
};