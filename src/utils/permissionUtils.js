const { PermissionsBitField, EmbedBuilder } = require('discord.js');

const { consoleLog, writeLogToFile } = require('../services/logger.js');
const { getModLogChannel, getSystemLogChannel } = require('./channelUtils.js');
const { formatPermissions } = require('./formatPermissions');

function compareChannelOverwrites(oldPerms, newPerms, guild) {
    const changes = [];

    newPerms.forEach((newOverwrite, id) => {
        const oldOverwrite = oldPerms.get(id);
        const name = id === guild.id ? '@everyone' : `<@&${id}>`;

        const diffs = [];

        const allPerms = new Set([
            ...new PermissionsBitField(newOverwrite.allow).toArray(),
            ...new PermissionsBitField(newOverwrite.deny).toArray(),
            ...(oldOverwrite ? new PermissionsBitField(oldOverwrite.allow).toArray() : []),
            ...(oldOverwrite ? new PermissionsBitField(oldOverwrite.deny).toArray() : []),
        ]);

        allPerms.forEach(perm => {
            const wasAllowed = oldOverwrite?.allow.has(perm);
            const wasDenied = oldOverwrite?.deny.has(perm);
            const nowAllowed = newOverwrite.allow.has(perm);
            const nowDenied = newOverwrite.deny.has(perm);

            const oldStatus = wasAllowed ? '✅' : wasDenied ? '❌' : '⚪';
            const newStatus = nowAllowed ? '✅' : nowDenied ? '❌' : '⚪';

            if (oldStatus !== newStatus) {
                diffs.push(`${formatPermissions([perm])} ${oldStatus} → ${newStatus}`);
            }
        });

        if (diffs.length > 0) {
            changes.push(`**${name}**\n> ${diffs.join('\n> ')}`);
        }
    });

    // Detect removed overwrites
    oldPerms.forEach((oldOverwrite, id) => {
        if (!newPerms.has(id)) {
            const name = id === guild.id ? '@everyone' : `<@&${id}>`;
            changes.push(`**${name}** overwrite removed`);
        }
    });

    return changes.join('\n\n') || null;
}

function compareRolePermissions(oldRole, newRole) {
    const changes = [];

    const allPerms = new Set([
        ...oldRole.permissions.toArray(),
        ...newRole.permissions.toArray(),
    ]);

    allPerms.forEach(perm => {
        const had = oldRole.permissions.has(perm);
        const has = newRole.permissions.has(perm);

        if (had !== has) {
            changes.push(
                `${formatPermissions([perm])} ${had ? '✅' : '❌'} → ${has ? '✅' : '❌'}`
            );
        }
    });

    return changes;
}

function checkIfBotHasPermission(guild, permission) {
    const botMember = guild.members.me;
    if (!botMember) {
        consoleLog('error', `Bot is not a member of guild ${guild.id}`);
        writeLogToFile('error', `Bot is not a member of guild ${guild.id}`);
        return false;
    }

    if (!botMember.permissions.has(permission)) {
        consoleLog('warning', `Bot lacks permission '${formatPermissions([permission])}' in guild '${guild.name}' (${guild.id})`);
        writeLogToFile('warning', `Bot lacks permission '${formatPermissions([permission])}' in guild '${guild.name}' (${guild.id})`);

        const channel = getSystemLogChannel(guild) || getModLogChannel(guild);
        if (!channel) {
            consoleLog('warning', `No system log or modlog channel found in guild '${guild.name}' (${guild.id}) to log missing permission '${formatPermissions([permission])}'`);
            writeLogToFile('warning', `No system log or modlog channel found in guild '${guild.name}' (${guild.id}) to log missing permission '${formatPermissions([permission])}'`);
            return false;
        }

        const embed = new EmbedBuilder()
            .setTitle(':warning: Missing Permission')
            .setDescription(`The bot lacks the required permission: **${formatPermissions([permission])}**. Please ensure the bot has this permission to function correctly.`)
            .setColor(process.env.COLOR_YELLOW)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        channel.send({ embeds: [embed] });
        return false;
    }

    return true;
}

module.exports = { 
    compareChannelOverwrites,
    compareRolePermissions,
    checkIfBotHasPermission
};
