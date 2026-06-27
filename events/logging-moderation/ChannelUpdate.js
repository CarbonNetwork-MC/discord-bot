const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { consoleLog } = require('../../src/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');
const { compareOverwrites } = require('../../utils/compareOverwrites.js');

module.exports = {
    name: Events.ChannelUpdate,
    once: false,
    execute: async (oldChannel, newChannel) => {
        const logChannel = getModLogChannel(newChannel.guild);
        if (!logChannel) return;

        const changes = [];

        let updatedBy = 'Unknown';

        // Fetch the audit logs to find out who updated the channel
        try {
            const auditLogs = await newChannel.guild.fetchAuditLogs({
                type: AuditLogEvent.ChannelUpdate,
                limit: 5,
            });

            const updateLog = auditLogs.entries.find(entry =>
                entry.target.id === newChannel.id &&
                Date.now() - entry.createdTimestamp < 5000 // Check if the update happened within the last 5 seconds
            );

            if (updateLog) {
                updatedBy = `${updateLog.executor.tag} (<@${updateLog.executor.id}>)`;
            }
        } catch (err) {
            consoleLog('error', `Error fetching audit logs for channel update: ${err}`);
        }

        // Header: Channel name, ID, and who updated it
        changes.push(`**Channel:** <#${newChannel.id}>`);
        changes.push(`**ID:** \`${newChannel.id}\``);
        changes.push(`**Updated By:** ${updatedBy}\n`);

        // Changed name
        if (oldChannel.name !== newChannel.name) {
            changes.push(`**Name:** \`${oldChannel.name}\` → \`${newChannel.name}\``);
        }

        // Changed topic (text channels only)
        if ('topic' in oldChannel && oldChannel.topic !== newChannel.topic) {
            changes.push(`**Topic:** \`${oldChannel.topic || 'None'}\` → \`${newChannel.topic || 'None'}\``);
        }

        // Changed slowmode (rate limit per user)
        if ('rateLimitPerUser' in oldChannel && oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
            changes.push(`**Slowmode:** \`${oldChannel.rateLimitPerUser}s\` → \`${newChannel.rateLimitPerUser}s\``);
        }

        // Changed NSFW
        if ('nsfw' in oldChannel && oldChannel.nsfw !== newChannel.nsfw) {
            changes.push(`**NSFW:** \`${oldChannel.nsfw}\` → \`${newChannel.nsfw}\``);
        }

        // Changed category (parent)
        if (oldChannel.parentId !== newChannel.parentId) {
            const oldParent = oldChannel.parent?.name || 'None';
            const newParent = newChannel.parent?.name || 'None';
            changes.push(`**Category:** \`${oldParent}\` → \`${newParent}\``);
        }

        // Permission changes
        const permChanges = compareOverwrites(
            oldChannel.permissionOverwrites.cache,
            newChannel.permissionOverwrites.cache,
            newChannel.guild
        );

        if (permChanges) {
            changes.push(`**Permission Changes:**\n${permChanges}`);
        }

        // No actual changes detected
        if (changes.length <= 2) return; // Only header present

        const embed = new EmbedBuilder()
            .setTitle(':pencil: Channel updated')
            .setDescription(changes.join('\n'))
            .setColor(process.env.COLOR_BLUE || 'Yellow')
            .setFooter({ text: process.env.EMBED_FOOTER || '' })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    }
};
