const { Events, EmbedBuilder } = require('discord.js');

const { consoleLog, writeLogToFile } = require('../../services/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');

module.exports = {
    name: Events.GuildBanRemove,
    once: false,
    execute: async (ban) => {
        const logChannel = getModLogChannel(ban.guild);
        if (!logChannel) return;

        // Check if the event is loaded in the logging settings for this guild
        const client = ban.client;
        const loggingSettings = client.loggingSettings.get(ban.guild.id);
        if (!loggingSettings || !loggingSettings.GuildBanRemove) return;

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
            writeLogToFile('error', `Error sending unban log message: ${err}`);
        }
    }
}