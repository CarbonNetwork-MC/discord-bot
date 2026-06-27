const { PermissionsBitField } = require('discord.js');
const { formatPermissions } = require('./formatPermissions');

function compareOverwrites(oldPerms, newPerms, guild) {
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

module.exports = { compareOverwrites };
