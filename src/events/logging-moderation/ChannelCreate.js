const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');

const { consoleLog } = require('../../services/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');
const { compareOverwrites } = require('../../utils/compareOverwrites.js');
const { formatPermissions } = require('../../utils/formatPermissions.js');

const ChannelTypes = require('../../config/enums/ChannelTypeLabels.js');

module.exports = {
    name: Events.ChannelCreate,
    once: false,
    execute: async (channel) => {
        const logChannel = getModLogChannel(channel.guild);
        if (!logChannel) return;

        // Format channel type
        const typeName = ChannelTypes[channel.type] || 'Unknown';

        // Role overrides (new channel vs. empty old state)
        const permChanges = compareOverwrites(
            new Map(), // old perms (none for a new channel)
            channel.permissionOverwrites.cache,
            channel.guild
        );

        let createdBy = 'Unknown';

        // Fetch the audit logs to find out who created the channel
        try {
            const auditLogs = await channel.guild.fetchAuditLogs({
                type: AuditLogEvent.ChannelCreate,
                limit: 5,
            });

            const creationLog = auditLogs.entries.find(entry =>
                entry.target.id === channel.id &&
                Date.now() - entry.createdTimestamp < 5000 // Check if the creation happened within the last 5 seconds
            );

            if (creationLog) {
                createdBy = `${creationLog.executor.tag} (<@${creationLog.executor.id}>)`;
            }
        } catch (err) {
            consoleLog('error', `Error fetching audit logs for channel creation: ${err}`);
        }

        const embed = new EmbedBuilder()
            .setTitle(':sparkles: Channel created')
            .setDescription(
                `**Name:** ${channel.name}\n` +
                `**Category:** ${channel.parent?.name ?? 'None'}\n` +
                `**ID:** ${channel.id}\n` +
                `**Type:** ${typeName}\n` +
                `**Created By:** ${createdBy}\n\n` +
                (permChanges ? `**Role Overrides:**\n${permChanges}` : 'No specific role overrides')
            )
            .setColor(process.env.COLOR_GREEN)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    }
};
