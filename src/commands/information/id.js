const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,
    data: new SlashCommandBuilder()
        .setName('id')
        .setDescription('Get the ID of the user or channel you are currently interacting with.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get the ID of'))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to get the ID of')),
                
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const channel = interaction.options.getChannel('channel');
        let id;

        if (user) {
            id = user.id;
        } else if (channel) {
            id = channel.id;
        } else {
            id = interaction.user.id; // fallback to command user
        }

        const embed = new EmbedBuilder()
            .setTitle(':identification_card: ID Information')
            .setDescription(`${user ? `User: **${user.displayName}**` : ''}${channel ? `Channel: **${channel.name}**` : ''}`)
            .addFields({ name: 'ID', value: id, inline: true })
            .setThumbnail(user ? user.displayAvatarURL() : channel ? channel.guild.iconURL() : interaction.user.displayAvatarURL())
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};