const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');

const { consoleLog, writeLogToFile } = require('../../services/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');
const { checkIfBotHasPermission } = require('../../utils/permissionUtils.js');

module.exports = {
    name: Events.GuildRoleDelete,
    once: false,
    execute: async (role) => {
        const logChannel = getModLogChannel(role.guild);
        if (!logChannel) return;

        let deletedBy = 'Unknown';

        // Check if the bot has permission to view the audit logs
        if (checkIfBotHasPermission(role.guild, 'ViewAuditLog')) {
            // Fetch the audit logs to find out who deleted the role
            try {
                const auditLogs = await role.guild.fetchAuditLogs({
                    type: AuditLogEvent.RoleDelete,
                    limit: 5,
                });

                const deletionLog = auditLogs.entries.find(entry =>
                    entry.target.id === role.id &&
                    Date.now() - entry.createdTimestamp < 5000 // Check if the deletion happened within the last 5 seconds
                );

                if (deletionLog) {
                    deletedBy = `${deletionLog.executor.tag} (<@${deletionLog.executor.id}>)`;
                }
            } catch (err) {
                consoleLog('error', `Error fetching audit logs for role deletion: ${err}`);
                writeLogToFile('error', `Error fetching audit logs for role deletion: ${err}`);
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(':wastebasket: Role deleted')
            .setDescription(
                `**Name:** ${role.name}\n` +
                `**ID:** ${role.id}\n` +
                `**Deleted By:** ${deletedBy}\n`
            )
            .setColor(process.env.COLOR_RED)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        try {
            await logChannel.send({ embeds: [embed] });
        } catch (err) {
            consoleLog('error', `Error sending role deletion log: ${err}`);
            writeLogToFile('error', `Error sending role deletion log: ${err}`);
        }
    }
}