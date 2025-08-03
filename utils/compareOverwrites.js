const { getPerms } = require('./formatPermissions');

function compareOverwrites(oldPerms, newPerms, guild) {
    const changes = [];

    // Added or modified overwrites
    newPerms.forEach((newOverwrite, id) => {
        const oldOverwrite = oldPerms.get(id);
        const name = id === guild.id ? '@everyone' : `<@&${id}>`;

        if (!oldOverwrite) {
            const added = getPerms(newOverwrite.allow);
            const denied = getPerms(newOverwrite.deny);
            changes.push(`**${name}**\n> ✅ Allowed: ${added || 'None'}\n> ❌ Denied: ${denied || 'None'}`);
        } else {
            const added = getPerms(newOverwrite.allow).split(', ').filter(p => !oldOverwrite.allow.has(p));
            const removed = getPerms(oldOverwrite.allow).split(', ').filter(p => !newOverwrite.allow.has(p));

            const deniedAdded = getPerms(newOverwrite.deny).split(', ').filter(p => !oldOverwrite.deny.has(p));
            const deniedRemoved = getPerms(oldOverwrite.deny).split(', ').filter(p => !newOverwrite.deny.has(p));

            if (added.length || removed.length || deniedAdded.length || deniedRemoved.length) {
                let msg = `✏️ **${name}**\n`;
                if (added.length) msg += `> ✅ Added: ${added.join(', ')}\n`;
                if (removed.length) msg += `> ✅ Removed: ${removed.join(', ')}\n`;
                if (deniedAdded.length) msg += `> ❌ Newly Denied: ${deniedAdded.join(', ')}\n`;
                if (deniedRemoved.length) msg += `> ❌ Removed Deny: ${deniedRemoved.join(', ')}\n`;
                changes.push(msg.trim());
            }
        }
    });

    // Removed overwrites
    oldPerms.forEach((oldOverwrite, id) => {
        if (!newPerms.has(id)) {
            const name = id === guild.id ? '@everyone' : `<@&${id}>`;
            changes.push(`➖ **${name}** overwrite removed`);
        }
    });

    return changes.join('\n\n') || null;
}

module.exports = { compareOverwrites };