const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');

const  { consoleLog, writeLogToFile } = require('../../services/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');
const { compareRolePermissions, checkIfBotHasPermission } = require('../../utils/permissionUtils.js');

const roleUpdateCooldowns = new Map();
const ROLE_UPDATE_DELAY = 2000;

module.exports = {
    name: Events.GuildRoleUpdate,
    once: false,
    execute: async (oldRole, newRole) => {
        const logChannel = getModLogChannel(newRole.guild);
        if (!logChannel) return;

        // Check if the event is loaded in the logging settings for this guild
        const client = newRole.client;
        const loggingSettings = client.loggingSettings.get(newRole.guild.id);
        if (!loggingSettings || !loggingSettings.GuildRoleUpdate) return;

        const key = `${newRole.guild.id}:${newRole.id}`;
        const existing = roleUpdateCooldowns.get(key);

        if (existing) {
            clearTimeout(existing.timeout);

            roleUpdateCooldowns.set(key, {
                oldRole: existing.oldRole,
                newRole,
                timeout: setTimeout(async () => {
                    const data = roleUpdateCooldowns.get(key);
                    roleUpdateCooldowns.delete(key);

                    await handleRoleUpdate(data.oldRole, data.newRole);
                }, ROLE_UPDATE_DELAY),
            });

            return;
        }

        roleUpdateCooldowns.set(key, {
            oldRole,
            newRole,
            timeout: setTimeout(async () => {
                const data = roleUpdateCooldowns.get(key);
                roleUpdateCooldowns.delete(key);

                await handleRoleUpdate(data.oldRole, data.newRole);
            }, ROLE_UPDATE_DELAY),
        });

        async function handleRoleUpdate(oldRole, newRole) {
            let updatedBy = 'Unknown';

            // Check if the bot has permission to view the audit logs
            if (checkIfBotHasPermission(newRole.guild, 'ViewAuditLog')) {
                // Fetch the audit logs to find out who updated the role
                try {
                    const auditLogs = await newRole.guild.fetchAuditLogs({
                        type: AuditLogEvent.RoleUpdate,
                        limit: 5,
                    });

                    const updateLog = auditLogs.entries.find(entry =>
                        entry.target.id === newRole.id &&
                        entry.action === AuditLogEvent.RoleUpdate &&
                        Date.now() - entry.createdTimestamp < 5000 // 5 seconds
                    );

                    if (updateLog) {
                        updatedBy = `${updateLog.executor.tag} (${updateLog.executor.id})`;
                    }
                } catch (error) {
                    consoleLog(`Error fetching audit logs for role update: ${error}`, 'error');
                    writeLogToFile(`Error fetching audit logs for role update: ${error}`);
                }
            }

            const changes = [];

            // Header: Role name, ID, and who updated it
            changes.push(`**Role:** ${newRole.name}`);
            changes.push(`**ID:** \`${newRole.id}\``);
            changes.push(`**Updated by:** ${updatedBy}`);

            // Changed name
            if (oldRole.name !== newRole.name) {
                changes.push(`**Name changed:** \`${oldRole.name}\` → \`${newRole.name}\``);
            }

            // Changed color
            if (oldRole.color !== newRole.color) {
                changes.push(`**Color changed:** [${oldRole.hexColor}](https://singlecolorimage.com/get/${oldRole.hexColor.replace('#', '')}/200x200) → [${newRole.hexColor}](https://singlecolorimage.com/get/${newRole.hexColor.replace('#', '')}/200x200)`);
            }

            // Display separately
            if (oldRole.hoist !== newRole.hoist) {
                changes.push(`**Display separately changed:** \`${oldRole.hoist ? 'Yes' : 'No'}\` → \`${newRole.hoist ? 'Yes' : 'No'}\``);
            }

            // Changed mentionable
            if (oldRole.mentionable !== newRole.mentionable) {
                changes.push(`**Mentionable changed:** \`${oldRole.mentionable ? 'Yes' : 'No'}\` → \`${newRole.mentionable ? 'Yes' : 'No'}\``);
            }

            // Changed permissions
            const permissionChanges = compareRolePermissions(oldRole, newRole);

            if (permissionChanges && permissionChanges.length > 0) {
                changes.push(`**Permissions changed:**`);
                permissionChanges.forEach(change => {
                    changes.push(`- ${change}`);
                });
            }

            // No actual changes detected
            if (changes.length <= 3) return; // Only header present

            const embed = new EmbedBuilder()
                .setTitle(':pencil: Role updated')
                .setDescription(changes.join('\n'))
                .setThumbnail(`https://singlecolorimage.com/get/${newRole.hexColor.replace('#', '')}/100x100`)
                .setColor(process.env.COLOR_BLUE || 'Blue')
                .setFooter({ text: process.env.EMBED_FOOTER || '' })
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        }
    },
};