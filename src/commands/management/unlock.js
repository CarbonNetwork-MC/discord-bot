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
        .setName('unlock')
        .setDescription('Unlocks a channel')
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
		])
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to unlock')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for unlocking the channel')
                .setRequired(false)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            await channel.permissionOverwrites.edit(
                interaction.guild.roles.everyone, { 
                    SendMessages: null,
                    AddReactions: null,
                    CreatePublicThreads: null,
                    CreatePrivateThreads: null,
                }, 
                { reason: reason }
            );

            const embed = new EmbedBuilder()
                .setTitle(':unlock: Channel Unlocked')
                .setDescription(`The channel ${channel} has been unlocked.`)
                .setColor(process.env.COLOR_GREEN)
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
                .setTitle(':unlock: Channel Unlocked')
                .addFields(
                    { name: 'Channel', value: `${channel}`, inline: true },
                    { name: 'Moderator', value: `${interaction.user}`, inline: true },
                    { name: 'Reason', value: `${reason}`, inline: false }
                )
                .setColor(process.env.COLOR_GREEN)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();
            try {
                await modLogChannel.send({ embeds: [modLogEmbed] });
            } catch (error) {
                consoleLog('error', `Error sending mod log embed: ${error}`);
                writeLogToFile('error', `Error sending mod log embed: ${error}`);
            }
        } catch (error) {
            consoleLog('error', `Error unlocking channel: ${error}`);
            writeLogToFile('error', `Error unlocking channel: ${error}`);
        }
    }
}
