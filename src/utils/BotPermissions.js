const { EmbedBuilder } = require('discord.js');

const { consoleLog } = require('../services/logger.js');
const { getModLogChannel, getSystemLogChannel } = require('./channelUtils.js');
const { formatPermissions } = require('./formatPermissions.js');

function checkIfBotHasPermission(guild, permission) {
    const botMember = guild.members.me;
    if (!botMember) {
        consoleLog('error', `Bot is not a member of guild ${guild.id}`);
        return false;
    }

    if (!botMember.permissions.has(permission)) {
        consoleLog('warning', `Bot lacks permission '${formatPermissions([permission])}' in guild '${guild.name}' (${guild.id})`);

        const channel = getSystemLogChannel(guild) || getModLogChannel(guild);
        if (!channel) {
            consoleLog('warning', `No system log or modlog channel found in guild '${guild.name}' (${guild.id}) to log missing permission '${formatPermissions([permission])}'`);
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
    checkIfBotHasPermission,
};