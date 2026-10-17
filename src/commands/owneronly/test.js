const { 
    SlashCommandBuilder, 
    MessageFlags,
    ApplicationIntegrationType,
    InteractionContextType
} = require('discord.js');

const { WATCHDOG_SERVERS = '' } = process.env;

module.exports = {
    isDev: true,
    servers: null,
    allowedUsers: [
        process.env.OWNER_ID,
    ],
    requiredPermissions: null,

    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Test command for owner only')
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		])
        .addStringOption(option =>
            option.setName('input')
                .setDescription('Input string for testing')
                .setRequired(false)
        ),

    async execute(interaction) {
        const input = interaction.options.getString('input');
        
        // Implement your test command logic here


        // const settings = interaction.client.watchDogSettings;
        // if (input) {
        //     // const guildSettings = await settings.get(interaction.guild.id);

        //     // console.log(guildSettings);
        //     console.log(settings.isEnabled(interaction.guild.id, 'VoiceStateUpdate'));
        // } else {
        //     const monitoredServers = WATCHDOG_SERVERS
        //         .split(',')
        //         .map(id => id.trim())
        //         .filter(Boolean);

        //     console.log('Monitored Servers from .env:', monitoredServers);
        //     console.log('Monitored Servers from Cache:', settings.getKeys());

        //     console.log('Enabled Guilds:', settings.getEnabledGuilds());
        // }

        interaction.reply({ content: 'Test command executed successfully.', flags: MessageFlags.Ephemeral });
    }
}
