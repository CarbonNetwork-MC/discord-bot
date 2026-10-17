const { 
    SlashCommandBuilder, 
    EmbedBuilder,
    ApplicationIntegrationType,
    InteractionContextType
} = require('discord.js');

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Displays information about a user.')
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		])
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get information about')
        ),
        
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const status = member.presence?.status || 'Offline';

        const embed = new EmbedBuilder()
            .setTitle(`${user.displayName || member.displayName}'s Information`)
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .addFields(
                { name: 'User', value: `<@${user.id}>` },
                { name: 'ID', value: user.id },
                { name: 'Status', value: status },
                { name: 'Roles', value: member.roles.cache.filter(role => role.id !== interaction.guild.id).map(role => role.toString()).join(', ') || 'No roles' },
                { name: 'Created At', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>` },
                { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` },
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};