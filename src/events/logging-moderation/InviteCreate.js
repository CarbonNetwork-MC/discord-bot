const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');

const { consoleLog, writeLogToFile } = require('../../services/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');
const { checkIfBotHasPermission } = require('../../utils/permissionUtils.js');

module.exports = {
    name: Events.InviteCreate,
    once: false,
    execute: async (invite) => {
        const logChannel = getModLogChannel(invite.guild);
        if (!logChannel) return;

        // Check if the event is loaded in the logging settings for this guild
        const client = invite.client;
        const loggingSettings = client.loggingSettings.get(invite.guild.id);
        if (!loggingSettings || !loggingSettings.InviteCreate) return;

        let createdBy = 'Unknown';
        let roles = 'None';

        // Check if the bot has permission to view the audit logs
        if (checkIfBotHasPermission(invite.guild, 'ViewAuditLog')) {
            // Fetch the audit logs to find out who created the invite
            try {
                const auditLogs = await invite.guild.fetchAuditLogs({
                    type: AuditLogEvent.InviteCreate,
                    limit: 5,
                });

                const creationLog = auditLogs.entries.find(entry =>
                    entry.target.code === invite.code &&
                    Date.now() - entry.createdTimestamp < 5000 // Check if the creation happened within the last 5 seconds
                );

                if (creationLog) {
                    createdBy = `${creationLog.executor.tag} (<@${creationLog.executor.id}>)`;
                    
                    const roleIdsChange = creationLog.changes?.find(change => change.key === 'role_ids');
                    const roleIds = roleIdsChange?.new ?? roleIdsChange?.old ?? [];

                    if (!Array.isArray(roleIds) || roleIds.length === 0) {
                        roles = 'None';
                    }

                    roles = roleIds
                        .map(roleId => invite.guild.roles.cache.get(roleId))
                        .filter(Boolean)
                        .map(role => `<@&${role.id}>`)
                        .join(', ') || 'None';
                }
            } catch (err) {
                consoleLog('error', `Error fetching audit logs for invite creation: ${err}`);
                writeLogToFile('error', `Error fetching audit logs for invite creation: ${err}`);
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(':sparkles: Invite created')
            .setDescription(
                `**Code:** https://discord.gg/${invite.code}\n` +
                `**Channel:** ${invite.channel?.name ?? 'Unknown'}\n` +
                `**Max Uses:** ${invite.maxUses === 0 ? 'Unlimited' : invite.maxUses}\n` +
                `**Temporary:** ${invite.temporary ? 'Yes' : 'No'}\n` +
                `**Expires At:** ${invite.expiresAt ? `<t:${Math.floor(invite.expiresAt.getTime() / 1000)}:F>` : 'Never'}\n` +
                `**Created By:** ${createdBy}\n` +
                `**Roles:** ${roles}`
            )
            .setColor(process.env.COLOR_GREEN)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        try {
            await logChannel.send({ embeds: [embed] });
        } catch (err) {
            consoleLog('error', `Error sending invite creation log: ${err}`);
            writeLogToFile('error', `Error sending invite creation log: ${err}`);
        }
    }
}