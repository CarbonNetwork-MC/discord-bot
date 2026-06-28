const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');

const { consoleLog } = require('../../services/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');
const { checkIfBotHasPermission } = require('../../utils/BotPermissions.js');

const memberUpdateCooldowns = new Map();
const MEMBER_UPDATE_DELAY = 1500;

module.exports = {
    name: Events.GuildMemberUpdate,
    once: false,
    execute: async (oldMember, newMember) => {
        const modLogChannel = getModLogChannel(newMember.guild);
        if (!modLogChannel) return;

        const key = `${newMember.guild.id}:${newMember.id}`;
        const existing = memberUpdateCooldowns.get(key);
        if (existing) {
            clearTimeout(existing.timeout);

            memberUpdateCooldowns.set(key, {
                oldMember: existing.oldMember,
                newMember,
                timeout: setTimeout(async () => {
                    const data = memberUpdateCooldowns.get(key);
                    memberUpdateCooldowns.delete(key);

                    await handleMemberUpdate(data.oldMember, data.newMember);
                }, MEMBER_UPDATE_DELAY),
            });

            return;
        }

        memberUpdateCooldowns.set(key, {
            oldMember,
            newMember,
            timeout: setTimeout(async () => {
                const data = memberUpdateCooldowns.get(key);
                memberUpdateCooldowns.delete(key);

                await handleMemberUpdate(data.oldMember, data.newMember);
            }, MEMBER_UPDATE_DELAY),
        });

        async function handleMemberUpdate(oldMember, newMember) {
            const memberChanges = [];
            const timeoutChanges = [];

            // Member Changes
            // Nickname
            if (oldMember.nickname !== newMember.nickname) {
                memberChanges.push(
                    `**Nickname**\n` +
                    `Before: ${oldMember.nickname ?? oldMember.displayName}\n` +
                    `After: ${newMember.nickname ?? newMember.displayName}`
                );
            }

            // Roles
            const addedRoles = newMember.roles.cache.filter(
                role => !oldMember.roles.cache.has(role.id)
            );

            const removedRoles = oldMember.roles.cache.filter(
                role => !newMember.roles.cache.has(role.id)
            );

            if (addedRoles.size > 0) {
                memberChanges.push(
                    `**Roles Added:** ${addedRoles.map(role => `<@&${role.id}>`).join(', ')}`
                );
            }

            if (removedRoles.size > 0) {
                memberChanges.push(
                    `**Roles Removed:** ${removedRoles.map(role => `<@&${role.id}>`).join(', ')}`
                );
            }

            // Server Avatar
            if (oldMember.avatar !== newMember.avatar) {
                memberChanges.push(
                    `**Server Avatar**\n` +
                    `Before: ${oldMember.avatar ? `[View](${oldMember.avatarURL()})` : 'None'}\n` +
                    `After: ${newMember.avatar ? `[View](${newMember.avatarURL()})` : 'None'}`
                );
            }

            // Server Banner
            if (oldMember.banner !== newMember.banner) {
                memberChanges.push(
                    `**Server Banner**\n` +
                    `Before: ${oldMember.banner ? `[View](${oldMember.bannerURL()})` : 'None'}\n` +
                    `After: ${newMember.banner ? `[View](${newMember.bannerURL()})` : 'None'}`
                );
            }

            // Timeout Changes
            const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
            const newTimeout = newMember.communicationDisabledUntilTimestamp;

            if (oldTimeout !== newTimeout) {
                let reason = 'None';

                if (checkIfBotHasPermission(newMember.guild, 'ViewAuditLog')) {
                    try {
                        const auditLogs = await newMember.guild.fetchAuditLogs({
                            type: AuditLogEvent.MemberUpdate,
                            limit: 5,
                        });

                        const timeoutLog = auditLogs.entries.find(entry =>
                            entry.target.id === newMember.id &&
                            entry.changes.some(change => change.key === 'communication_disabled_until') &&
                            Date.now() - entry.createdTimestamp < 5000
                        );

                        if (timeoutLog) {
                            reason = timeoutLog.reason || 'No reason provided';
                        }
                    } catch (err) {
                        consoleLog('error', `Error fetching audit logs for timeout update: ${err}`);
                    }
                }

                if (!oldTimeout && newTimeout) {
                    timeoutChanges.push(
                        `Expires: <t:${Math.floor(newTimeout / 1000)}:F>\n` +
                        `Remaining: ${formatDuration(newTimeout - Date.now())}\n` +
                        `Reason: ${reason}`
                    );
                } else if (oldTimeout && !newTimeout) {
                    timeoutChanges.push(
                        `Previous expiry: <t:${Math.floor(oldTimeout / 1000)}:F>\n` +
                        `Reason: ${reason}`
                    );
                } else {
                    timeoutChanges.push(
                        `Before: <t:${Math.floor(oldTimeout / 1000)}:F>\n` +
                        `After: <t:${Math.floor(newTimeout / 1000)}:F>\n` +
                        `Remaining: ${formatDuration(newTimeout - Date.now())}\n` +
                        `Reason: ${reason}`
                    );
                }
            }

            try {
                if (memberChanges.length > 0) {
                    const memberEmbed = new EmbedBuilder()
                        .setTitle(':pencil: Member Updated')
                        .setDescription(
                            `**Member:** ${newMember.user.tag} (<@${newMember.user.id}>)\n\n` +
                            memberChanges.join('\n\n')
                        )
                        .setColor(process.env.COLOR_YELLOW)
                        .setFooter({ text: process.env.EMBED_FOOTER })
                        .setTimestamp();

                    await modLogChannel.send({ embeds: [memberEmbed] });
                }

                if (timeoutChanges.length > 0) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setTitle(':mute: Member Received Timeout')
                        .setDescription(
                            `**Member:** ${newMember.user.tag} (<@${newMember.user.id}>)\n\n` +
                            timeoutChanges.join('\n\n')
                        )
                        .setColor(process.env.COLOR_ORANGE)
                        .setFooter({ text: process.env.EMBED_FOOTER })
                        .setTimestamp();

                    await modLogChannel.send({ embeds: [timeoutEmbed] });
                }
            } catch (err) {
                consoleLog('error', `Error sending member update log to mod-log channel: ${err}`);
            }
        }

        function formatDuration(ms) {
            if (!ms || ms <= 0) return 'Expired';

            const totalSeconds = Math.floor(ms / 1000);

            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const parts = [];

            if (days) parts.push(`${days}d`);
            if (hours) parts.push(`${hours}h`);
            if (minutes) parts.push(`${minutes}m`);
            if (seconds && parts.length === 0) parts.push(`${seconds}s`);

            return parts.join(' ');
        }
    }
}