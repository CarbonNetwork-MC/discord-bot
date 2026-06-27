const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');

const { consoleLog } = require('../../services/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');
const { checkIfBotHasPermission } = require('../../utils/BotPermissions.js');

module.exports = {
    name: Events.ChannelDelete,
    once: false,
    execute: async (channel) => {
        const logChannel = getModLogChannel(channel.guild);
        if (!logChannel) return;

        let deletedBy = 'Unknown';

        // Check if the bot has permission to view the audit logs
        if (checkIfBotHasPermission(channel.guild, 'ViewAuditLog')) {
            // Fetch the audit logs to find out who deleted the channel
            try {
                const auditLogs = await channel.guild.fetchAuditLogs({
                    type: AuditLogEvent.ChannelDelete,
                    limit: 5,
                });

                const deletionLog = auditLogs.entries.find(entry =>
                    entry.target.id === channel.id &&
                    Date.now() - entry.createdTimestamp < 5000 // Check if the deletion happened within the last 5 seconds
                );

                if (deletionLog) {
                    deletedBy = `${deletionLog.executor.tag} (<@${deletionLog.executor.id}>)`;
                }
            } catch (err) {
                consoleLog('error', `Error fetching audit logs for channel deletion: ${err}`);
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(':wastebasket: Channel deleted')
            .setDescription(
                `**Name:** ${channel.name}\n` +
                `**Category:** ${channel.parent?.name ?? 'None'}\n` +
                `**Deleted By:** ${deletedBy}\n` +
                `**ID:** ${channel.id}\n` +
                `**Type:** ${channel.type}\n`
            )
            .setColor(process.env.COLOR_RED)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    }
}