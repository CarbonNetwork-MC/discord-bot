const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');

const { consoleLog, writeLogToFile } = require('../../services/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');
const { checkIfBotHasPermission } = require('../../utils/permissionUtils.js');

module.exports = {
    name: Events.GuildRoleCreate,
    once: false,
    execute: async (role) => {
        const logChannel = getModLogChannel(role.guild);
        if (!logChannel) return;

        // Check if the event is loaded in the logging settings for this guild
        const client = role.client;
        const loggingSettings = client.loggingSettings.get(role.guild.id);
        if (!loggingSettings || !loggingSettings.GuildRoleCreate) return;

        let createdBy = 'Unknown';

        // Check if the bot has permission to view the audit logs
        if (checkIfBotHasPermission(role.guild, 'ViewAuditLog')) {
            // Fetch the audit logs to find out who created the role
            try {
                const auditLogs = await role.guild.fetchAuditLogs({
                    type: AuditLogEvent.RoleCreate,
                    limit: 5,
                });

                const creationLog = auditLogs.entries.find(entry =>
                    entry.target.id === role.id &&
                    Date.now() - entry.createdTimestamp < 5000 // Check if the creation happened within the last 5 seconds
                );

                if (creationLog) {
                    createdBy = `${creationLog.executor.tag} (<@${creationLog.executor.id}>)`;
                }
            } catch (err) {
                consoleLog('error', `Error fetching audit logs for role creation: ${err}`);
                writeLogToFile('error', `Error fetching audit logs for role creation: ${err}`);
            }
        }

        // Name, Created By
        const embed = new EmbedBuilder()
            .setTitle(':sparkles: Role created')
            .setDescription(
                `**Name:** ${role.name}\n` +
                `**ID:** ${role.id}\n` +
                `**Created By:** ${createdBy}\n`
            )
            .setColor(process.env.COLOR_GREEN)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        try {
            await logChannel.send({ embeds: [embed] });
        } catch (err) {
            consoleLog('error', `Error sending role creation log: ${err}`);
            writeLogToFile('error', `Error sending role creation log: ${err}`);
        }
    }
}
