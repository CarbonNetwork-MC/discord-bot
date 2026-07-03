const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');

const { consoleLog, writeLogToFile } = require('../../services/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');
const { checkIfBotHasPermission } = require('../../utils/permissionUtils.js');

module.exports = {
    name: Events.InviteDelete,
    once: false,
    execute: async (invite) => {
        const logChannel = getModLogChannel(invite.guild);
        if (!logChannel) return;

        // Check if the event is loaded in the logging settings for this guild
        const client = invite.client;
        const loggingSettings = client.loggingSettings.get(invite.guild.id);
        if (!loggingSettings || !loggingSettings.InviteDelete) return;

        let deletedBy = 'Unknown';

        // Check if the bot has permission to view the audit logs
        if (checkIfBotHasPermission(invite.guild, 'ViewAuditLog')) {
            // Fetch the audit logs to find out who deleted the invite
            try {
                const auditLogs = await invite.guild.fetchAuditLogs({
                    type: AuditLogEvent.InviteDelete,
                    limit: 5,
                });

                const deletionLog = auditLogs.entries.find(entry =>
                    entry.target.code === invite.code &&
                    Date.now() - entry.createdTimestamp < 5000 // Check if the deletion happened within the last 5 seconds
                );

                if (deletionLog) {
                    deletedBy = `${deletionLog.executor.tag} (<@${deletionLog.executor.id}>)`;
                }
            } catch (err) {
                consoleLog('error', `Error fetching audit logs for invite deletion: ${err}`);
                writeLogToFile('error', `Error fetching audit logs for invite deletion: ${err}`);
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(':x: Invite deleted')
            .setDescription(
                `**Code:** ${invite.code}\n` +
                `**Channel:** ${invite.channel?.name ?? 'Unknown'}\n` +
                `**Deleted By:** ${deletedBy}`
            )
            .setColor(process.env.COLOR_RED)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        try {
            await logChannel.send({ embeds: [embed] });
        } catch (err) {
            consoleLog('error', `Error sending invite deletion log: ${err}`);
            writeLogToFile('error', `Error sending invite deletion log: ${err}`);
        }
    }
}