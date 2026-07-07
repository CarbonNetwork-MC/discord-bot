const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ChannelType,
    ApplicationIntegrationType,
    InteractionContextType
} = require('discord.js');

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Displays information about the server.')
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		]),

    async execute(interaction) {
        const guild = interaction.guild;

        // Ensure members are fetched
        const members = await guild.members.fetch();
        const bots = members.filter(m => m.user.bot).size;
        const users = members.size - bots;

        const channels = guild.channels.cache;
        const categories = channels.filter(c => c.type === ChannelType.GuildCategory).size;
        const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;

        const embed = new EmbedBuilder()
            .setTitle(`${guild.name}`)
            .addFields(
                { name: 'Server ID', value: guild.id },
                { name: 'Owner', value: `<@${guild.ownerId}>` },
                { name: 'Channels', value: `Categories: ${categories} - Text: ${textChannels} - Voice: ${voiceChannels}` },
                { name: 'Members', value: `Users: ${users} - Bots: ${bots} - Total: ${guild.memberCount}` },
                { name: 'Created At', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F> (${Math.floor((Date.now() - guild.createdTimestamp) / 86400000)} day(s) ago)` },
            )
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};