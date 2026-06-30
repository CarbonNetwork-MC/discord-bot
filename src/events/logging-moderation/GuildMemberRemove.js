const { Events, EmbedBuilder } = require('discord.js');

const { consoleLog, writeLogToFile } = require('../../services/logger.js');
const { getModLogChannel, getJoinLogChannel } = require('../../utils/channelUtils.js');
const { getLeaveMessage, isLeaveEnabled } = require('../../config/guild-settings.js');

module.exports = {
    name: Events.GuildMemberRemove,
    once: false,
    execute: async (member) => {
        const modLogChannel = getModLogChannel(member.guild);
        const joinLogChannel = getJoinLogChannel(member.guild);
        const leaveMessage = getLeaveMessage(member.guild.id);
        const leaveEnabled = isLeaveEnabled(member.guild.id);

        const modLogEmbed = new EmbedBuilder()
            .setTitle(':outbox_tray: Member Left')
            .setDescription(
                `**Member:** ${member.user.tag} (<@${member.user.id}>)\n` +
                `**Account Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n` +
                `**Joined Server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
            )
            .setColor(process.env.COLOR_RED)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        // Send the mod log embed to the mod log channel
        try {
            if (modLogChannel) await modLogChannel.send({ embeds: [modLogEmbed] });
        } catch (err) {
            consoleLog('error', `Error sending member leave log: ${err}`);
            writeLogToFile('error', `Error sending member leave log: ${err}`);
        }

        // Replace placeholders in the leave message with actual values
        if (!leaveMessage)
            leaveMessage = `Goodbye {user}! We will miss you in {server}.`;

        const placeholders = {
            user: `<@${member.user.id}>`,
            username: member.user.username,
            server: member.guild.name,
            membercount: member.guild.memberCount,
        };

        if (leaveEnabled) {
            const personalizedLeaveMessage = leaveMessage.replace(
                /\{([^}]+)\}/gi,
                (match, key) => placeholders[key.toLowerCase()] ?? match
            );

            const leaveLogEmbed = new EmbedBuilder()
                .setTitle(':outbox_tray: Member Left')
                .setDescription(`${personalizedLeaveMessage}`)
                .setColor(process.env.COLOR_RED)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            try {
                if (joinLogChannel) await joinLogChannel.send({ embeds: [leaveLogEmbed] });
            } catch (err) {
                consoleLog('error', `Error sending member leave log: ${err}`);
                writeLogToFile('error', `Error sending member leave log: ${err}`);
            }
        }
    }
}