const { Events, EmbedBuilder } = require('discord.js');

const { consoleLog } = require('../../services/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');

module.exports = {
    name: Events.MessageUpdate,
    once: false,
    execute: async (oldMessage, newMessage) => {
        if (!oldMessage.guild || !oldMessage.author) return;

        const modLogChannel = getModLogChannel(oldMessage.guild);
        if (!modLogChannel) return;

        // Ignore messages which contain embeds and are sent by a bot, as these are likely system messages or automated messages
        if (oldMessage.embeds.length > 0 && oldMessage.author.bot) return;

        // Author, Channel, Old Message Content, New Message Content
        const embed = new EmbedBuilder()
            .setTitle(':pencil: Message Edited')
            .setDescription(
                `**Author:** ${oldMessage.author.tag} (<@${oldMessage.author.id}>)\n` +
                `**Channel:** <#${oldMessage.channel.id}>\n` +
                `\n**Old Message Content:** \n${oldMessage.content || 'No message content (possibly an embed or attachment)'}\n` +
                `\n**New Message Content:** \n${newMessage.content || 'No message content (possibly an embed or attachment)'}`
            )
            .setColor(process.env.COLOR_YELLOW)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        // If the message had attachments, add them to the embed
        if (oldMessage.attachments.size > 0) {
            const attachmentUrls = oldMessage.attachments.map(attachment => attachment.url).join('\n');
            embed.addFields({ name: 'Attachments', value: attachmentUrls });
        }

        try {
            await modLogChannel.send({ embeds: [embed] });
        } catch (err) {
            consoleLog('error', `Error sending message update log to mod-log channel: ${err}`);
        }
    }
}
