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
        .setName('avatar')
        .setDescription('Gives the avatar of mentioned user or yourself.')
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		])
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose avatar you want to see')
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const author = interaction.user;

        const isAnimated = user.avatar?.startsWith("a_");
        const baseURL = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`;

        const embed = new EmbedBuilder()
            .setAuthor({ name: author.tag, iconURL: author.displayAvatarURL() })
            .addFields({
                    name: 'Links:',
                    value: `[png](${baseURL}.png) | [jpg](${baseURL}.jpg) | [webp](${baseURL}.webp) ${isAnimated ? `| [gif](${baseURL}.gif)` : ''}`
                })
            .setColor(process.env.COLOR_BLUE)
            .setImage(user.displayAvatarURL({ format: 'png', size: 1024 }))
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}