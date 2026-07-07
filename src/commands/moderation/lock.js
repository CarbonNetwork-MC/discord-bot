const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ChannelType,
    ApplicationIntegrationType,
    InteractionContextType
} = require('discord.js');

const { consoleLog, writeLogToFile } = require('../../services/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: [
        'ManageChannels',
    ],

    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Locks a channel')
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
		])
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to lock')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for locking the channel')
                .setRequired(false)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            await channel.permissionOverwrites.edit(
                interaction.guild.roles.everyone, { 
                    SendMessages: false,
                    AddReactions: false,
                    CreatePublicThreads: false,
                    CreatePrivateThreads: false,
                }, 
                { reason: reason }
            );

            const embed = new EmbedBuilder()
                .setTitle(':lock: Channel Locked')
                .setDescription(`The channel ${channel} has been locked.`)
                .setColor(process.env.COLOR_RED)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            try {
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                consoleLog('error', `Error sending embed: ${error}`);
                writeLogToFile('error', `Error sending embed: ${error}`);
            }

            // Modlog
            const modLogChannel = await getModLogChannel(interaction.guild);
            if (!modLogChannel) return;

            const modLogEmbed = new EmbedBuilder()
                .setTitle(':lock: Channel Locked')
                .addFields(
                    { name: 'Channel', value: `${channel}`, inline: true },
                    { name: 'Moderator', value: `${interaction.user}`, inline: true },
                    { name: 'Reason', value: `${reason}`, inline: false }
                )
                .setColor(process.env.COLOR_RED)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();
            try {
                await modLogChannel.send({ embeds: [modLogEmbed] });
            } catch (error) {
                consoleLog('error', `Error sending mod log embed: ${error}`);
                writeLogToFile('error', `Error sending mod log embed: ${error}`);
            }
        } catch (error) {
            consoleLog('error', `Error locking channel: ${error}`);
            writeLogToFile('error', `Error locking channel: ${error}`);
        }
    }
}
