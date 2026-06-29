const { Events, EmbedBuilder } = require('discord.js');

const { consoleLog } = require('../../services/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');

module.exports = {
    name: Events.GuildBanRemove,
    once: false,
    execute: async (ban) => {
        const logChannel = getModLogChannel(ban.guild);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle(':white_check_mark: User unbanned')
            .setDescription(
                `**User:** ${ban.user.tag} (<@${ban.user.id}>)\n` +
                `**ID:** ${ban.user.id}`
            )
            .setColor(process.env.COLOR_GREEN)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        try {
            await logChannel.send({ embeds: [embed] });
        } catch (err) {
            consoleLog('error', `Error sending unban log message: ${err}`);
        }
    }
}