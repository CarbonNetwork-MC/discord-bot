const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { consoleLog } = require('../../services/logger.js');
const { checkModlogChannel, getModLogChannel } = require('../../utils/channelUtils.js');

module.exports = {
    name: Events.MessageDelete,
    once: false,
    execute: async (message) => {
        if (!message.guild || !message.author) return;

        const modLogChannel = getModLogChannel(message.guild);
        if (!modLogChannel) return;

        // Ignore messages which contain embeds and are send by a bot, as these are likely system messages or automated messages
        if (message.embeds.length > 0 && message.author.bot) return;

        let deletedBy = 'Unknown';

        // Fetch the audit logs to find out who deleted the message
        try {
            const auditLogs = await message.guild.fetchAuditLogs({
                type: AuditLogEvent.MessageDelete,
                limit: 5,
            });

            const deletionLog = auditLogs.entries.find(entry =>
                entry.target.id === message.author.id &&
                entry.extra.channel.id === message.channel.id &&
                Date.now() - entry.createdTimestamp < 5000 // Check if the deletion happened within the last 5 seconds
            );

            if (deletionLog) {
                deletedBy = `${deletionLog.executor.tag} (<@${deletionLog.executor.id}>)`;
            } else {
                deletedBy = `${message.author.tag} (<@${message.author.id}>)`;
            }
        } catch (err) {
            consoleLog('error', `Error fetching audit logs for message deletion: ${err}`);
        }

        // Author, Deleted by, Channel, Message Content
        const embed = new EmbedBuilder()
            .setTitle(':wastebasket: Message Deleted')
            .setDescription(
                `**Author:** ${message.author.tag} (<@${message.author.id}>)\n` +
                `**Deleted by:** ${deletedBy}\n` +
                `**Channel:** <#${message.channel.id}>\n` +
                `**Message Content:** \n${message.content || 'No message content (possibly an embed or attachment)'}`
            )
            .setColor(process.env.COLOR_RED)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        // If the message had attachments, add them to the embed
        if (message.attachments.size > 0) {
            const attachmentUrls = message.attachments.map(att => att.url).join('\n');
            embed.addFields({ name: 'Attachments', value: attachmentUrls });
        }

        modLogChannel.send({ embeds: [embed] });
    }
}
