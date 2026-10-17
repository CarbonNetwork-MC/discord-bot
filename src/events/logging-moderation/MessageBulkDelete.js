const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');

const { consoleLog, writeLogToFile } = require('../../services/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');
const { checkIfBotHasPermission } = require('../../utils/permissionUtils.js');

module.exports = {
    name: Events.MessageBulkDelete,
    once: false,
    execute: async (messages) => {
        if (!messages.first() || !messages.first().guild) return;

        const modLogChannel = getModLogChannel(messages.first().guild);
        if (!modLogChannel) return;

        // Check if the event is loaded in the logging settings for this guild
        const client = messages.first().client;
        const loggingSettings = client.loggingSettings.get(messages.first().guild.id);
        if (!loggingSettings || !loggingSettings.MessageBulkDelete) return;

        // Channel, Number of Messages Deleted
        const embed = new EmbedBuilder()
            .setTitle(':wastebasket: Bulk Messages Deleted')
            .setDescription(
                `**Channel:** <#${messages.first().channel.id}>\n` +
                `**Number of Messages Deleted:** ${messages.size}`
            )
            .setColor(process.env.COLOR_RED)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        // Send the embed to the mod log channel
        try {
            await modLogChannel.send({ embeds: [embed] });
        } catch (err) {
            consoleLog('error', `Error sending bulk message deletion log to mod log channel: ${err}`);
            writeLogToFile('error', `Error sending bulk message deletion log to mod log channel: ${err}`);
        }
    }
}