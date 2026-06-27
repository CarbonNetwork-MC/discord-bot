const { Events, EmbedBuilder } = require('discord.js');
const { consoleLog } = require('../../src/logger.js');
const { guildSettings } = require('../../src/guild-settings.js');

module.exports = {
    name: Events.ChannelDelete,
    once: false,
    execute: (channel) => {
        const logChannel = channel.guild.channels.cache.find(ch => ch.id === guildSettings[channel.guild.id]?.modLogId);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle(':wastebasket: Channel deleted')
            .setDescription(
                `**Name:** ${channel.name}\n**Category:** ${channel.parent?.name ?? 'None'}`
            )
            .setColor(process.env.COLOR_RED)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    }
}