const { Events, EmbedBuilder, ChannelType } = require('discord.js');

const { consoleLog } = require('../../src/logger.js');
const { guildSettings } = require('../../src/guild-settings.js');
const { compareOverwrites } = require('../../utils/compareOverwrites.js');
const { formatPermissions } = require('../../utils/formatPermissions.js');

module.exports = {
    name: Events.ChannelCreate,
    once: false,
    execute: (channel) => {
        const logChannel = channel.guild.channels.cache.find(ch => ch.id === guildSettings[channel.guild.id]?.modLogId);
        if (!logChannel) return;

        // Format channel type
        const typeName = TYPE_LABELS[channel.type] || 'Unknown';

        // Role overrides (new channel vs. empty old state)
        const permChanges = compareOverwrites(
            new Map(), // old perms (none for a new channel)
            channel.permissionOverwrites.cache,
            channel.guild
        );

        const embed = new EmbedBuilder()
            .setTitle(':sparkles: Channel created')
            .setDescription(
                `**Name:** ${channel.name}\n` +
                `**Category:** ${channel.parent?.name ?? 'None'}\n` +
                `**ID:** ${channel.id}\n` +
                `**Type:** ${typeName}\n\n` +
                (permChanges ? `**Role Overrides:**\n${permChanges}` : 'No specific role overrides')
            )
            .setColor(process.env.COLOR_GREEN)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    }
};
