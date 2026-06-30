const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');

const { consoleLog, writeLogToFile } = require('../../services/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');
const { checkIfBotHasPermission } = require('../../utils/permissionUtils.js');

module.exports = {
    name: Events.GuildBanAdd,
    once: false,
    execute: async (ban) => {
        const logChannel = getModLogChannel(ban.guild);
        if (!logChannel) return;

        let reason = 'No reason provided';
        let bannedBy = 'Unknown';
        let deletedMessages = '0 seconds';

        // Check if the bot has permission to view the audit logs
        if (checkIfBotHasPermission(ban.guild, 'ViewAuditLog')) {
            // Fetch the audit logs to find out who banned the user
            try {
                const auditLogs = await ban.guild.fetchAuditLogs({
                    type: AuditLogEvent.MemberBanAdd,
                    limit: 5,
                });

                const banLog = auditLogs.entries.find(entry =>
                    entry.target.id === ban.user.id &&
                    Date.now() - entry.createdTimestamp < 5000 // Check if the ban happened within the last 5 seconds
                );

                if (banLog) {
                    const rawReason = banLog.reason ?? 'No reason provided';

                    const moderatorMatch = rawReason.match(/\| Banned by: (\d+)/);
                    const durationMatch = rawReason.match(/\| Deleted messages: (\d+)s/);

                    if (moderatorMatch) {
                        const moderatorId = moderatorMatch[1];
                        const moderator = await ban.guild.members.fetch(moderatorId).catch(() => null);

                        bannedBy = moderator
                            ? `${moderator.user.tag} (<@${moderatorId}>)`
                            : `<@${moderatorId}>`;
                    } else {
                        bannedBy = `${banLog.executor.tag} (<@${banLog.executor.id}>)`;
                    }

                    const deletedMessagesSeconds = durationMatch
                        ? Number(durationMatch[1])
                        : null;

                    reason = rawReason
                        .replace(/\s*\| Banned by: \d+/, '')
                        .replace(/\s*\| Deleted messages: \d+s/, '')
                        .trim();

                    deletedMessages = deletedMessagesSeconds !== null
                        ? `${deletedMessagesSeconds} seconds`
                        : 'Unknown';
                }
            } catch (err) {
                consoleLog('error', `Error fetching audit logs: ${err}`);
                writeLogToFile('error', `Error fetching audit logs: ${err}`);
            }
        }

        // TODO: include the messages deleted in the ban log if possible (Discord.js does not provide this directly)
        const embed = new EmbedBuilder()
            .setTitle(':no_entry: User banned')
            .setDescription(
                `**User:** ${ban.user.tag} (<@${ban.user.id}>)\n` +
                `**ID:** ${ban.user.id}\n` +
                `**Banned By:** ${bannedBy}\n` +
                `**Reason:** ${reason}\n` +
                `**Deleted Messages:** ${deletedMessages}`
            )
            .setColor(process.env.COLOR_RED)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        try {
            await logChannel.send({ embeds: [embed] });
        } catch (err) {
            consoleLog('error', `Error sending ban log message: ${err}`);
            writeLogToFile('error', `Error sending ban log message: ${err}`);
        }
    }
}