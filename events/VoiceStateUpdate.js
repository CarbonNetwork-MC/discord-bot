const { Events, EmbedBuilder } = require('discord.js');
const { consoleLog } = require('../src/logger.js');
const { guildSettings } = require('../src/guild-settings.js');

module.exports = {
    name: Events.VoiceStateUpdate,
    once: false,
    execute: (oldState, newState) => {
        const logChannel = newState.guild.channels.cache.find(ch => ch.id === guildSettings[newState.guild.id]?.modLogId);
        if (!logChannel) return;
        
        // This fires when a user joins a voice channel
        if (!oldState.channelId && newState.channelId) {
            const embed = new EmbedBuilder()
                .setTitle(':telephone_receiver: Member joined a voice channel')
                .setDescription(`**${newState.member.user.tag}** joined <#${newState.channel.id}>`)
                .setAuthor({ name: newState.member.user.tag, iconURL: newState.member.user.displayAvatarURL() })
                .setColor(process.env.COLOR_GREEN)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            // Send the embed to the log channel
            logChannel.send({ embeds: [embed] });
        }

        // This fires when a user leaves a voice channel
        if (oldState.channelId && !newState.channelId) {
            const embed = new EmbedBuilder()
                .setTitle(':man_running: Member left a voice channel')
                .setDescription(`**${newState.member.user.tag}** left <#${oldState.channel.id}>`)
                .setAuthor({ name: newState.member.user.tag, iconURL: newState.member.user.displayAvatarURL() })
                .setColor(process.env.COLOR_RED)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            // Send the embed to the log channel
            logChannel.send({ embeds: [embed] });
        }

        // This fires when a user switches voice channels
        if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            const embed = new EmbedBuilder()
                .setTitle(':left_right_arrow: Member switched voice channels')
                .setDescription(`**Before:** <#${oldState.channel.id}>\n**After:** <#${newState.channel.id}>`)
                .setAuthor({ name: newState.member.user.tag, iconURL: newState.member.user.displayAvatarURL() })
                .setColor(process.env.COLOR_BLUE)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            // Send the embed to the log channel
            logChannel.send({ embeds: [embed] });
        }
    }
}