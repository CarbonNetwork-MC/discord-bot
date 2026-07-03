const { Events, EmbedBuilder } = require('discord.js');
const { consoleLog, writeLogToFile } = require('../../services/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');

module.exports = {
    name: Events.VoiceStateUpdate,
    once: false,
    execute: (oldState, newState) => {
        const logChannel = getModLogChannel(newState.guild);
        if (!logChannel) return;

        // Check if the event is loaded in the logging settings for this guild
        const client = newState.client;
        const loggingSettings = client.loggingSettings.get(newState.guild.id);
        if (!loggingSettings || !loggingSettings.VoiceStateUpdate) return;
        
        // This fires when a user joins a voice channel
        if (!oldState.channelId && newState.channelId) {
            const embed = new EmbedBuilder()
                .setTitle(':telephone_receiver: Member joined a voice channel')
                .setDescription(`**<@${newState.member.user.id}>** joined <#${newState.channel.id}>`)
                .setAuthor({ name: newState.member.user.tag, iconURL: newState.member.user.displayAvatarURL() })
                .setColor(process.env.COLOR_GREEN)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            // Send the embed to the log channel
            try {
                logChannel.send({ embeds: [embed] });
            } catch (err) {
                consoleLog('error', `Error sending voice state update log to mod-log channel: ${err}`);
                writeLogToFile('error', `Error sending voice state update log to mod-log channel: ${err}`);
            }
        }

        // This fires when a user leaves a voice channel
        if (oldState.channelId && !newState.channelId) {
            const embed = new EmbedBuilder()
                .setTitle(':man_running: Member left a voice channel')
                .setDescription(`**<@${newState.member.user.id}>** left <#${oldState.channel.id}>`)
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
                .setDescription(`**<@${newState.member.user.id}>** switched voice channels\n**Before:** <#${oldState.channel.id}>\n**After:** <#${newState.channel.id}>`)
                .setAuthor({ name: newState.member.user.tag, iconURL: newState.member.user.displayAvatarURL() })
                .setColor(process.env.COLOR_BLUE)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            // Send the embed to the log channel
            logChannel.send({ embeds: [embed] });
        }
    }
}