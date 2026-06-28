const { Events, EmbedBuilder } = require('discord.js');

const { consoleLog } = require('../../services/logger.js');
const { getModLogChannel, getJoinLogChannel } = require('../../utils/channelUtils.js');
const { getWelcomeMessage, isWelcomeEnabled } = require('../../config/guild-settings.js');

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    execute: async (member) => {
        const modLogChannel = getModLogChannel(member.guild);
        const joinLogChannel = getJoinLogChannel(member.guild);
        const welcomeMessage = getWelcomeMessage(member.guild.id);
        const welcomeEnabled = isWelcomeEnabled(member.guild.id);
        
        const modLogEmbed = new EmbedBuilder()
            .setTitle(':inbox_tray: Member Joined')
            .setDescription(
                `**Member:** ${member.user.tag} (<@${member.user.id}>)\n` +
                `**Account Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n` +
                `**Joined Server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
            )
            .setColor(process.env.COLOR_GREEN)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        // Send the mod log embed to the mod log channel
        try {
            if (modLogChannel) await modLogChannel.send({ embeds: [modLogEmbed] });
        } catch (err) {
            consoleLog('error', `Error sending member join log: ${err}`);
        }

        // Replace placeholders in the welcome message with actual values
        if (!welcomeMessage)
            welcomeMessage = `Welcome {user} to {server}! You are member number {membercount}.`;

        const placeholders = {
            user: `<@${member.user.id}>`,
            username: member.user.username,
            server: member.guild.name,
            membercount: member.guild.memberCount,
        };

        if (welcomeEnabled) {
            const personalizedWelcomeMessage = welcomeMessage.replace(
                /\{([^}]+)\}/gi,
                (match, key) => placeholders[key.toLowerCase()] ?? match
            );

            const joinLogEmbed = new EmbedBuilder()
                .setTitle(':inbox_tray: Member Joined')
                .setDescription(`${personalizedWelcomeMessage}`)
                .setColor(process.env.COLOR_GREEN)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            try {
                if (joinLogChannel) await joinLogChannel.send({ embeds: [joinLogEmbed] });
            } catch (err) {
                consoleLog('error', `Error sending member join log: ${err}`);
            }
        }        
    }
}