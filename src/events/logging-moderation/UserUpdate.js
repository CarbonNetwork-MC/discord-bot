const { Events, EmbedBuilder } = require('discord.js');

const { consoleLog, writeLogToFile } = require('../../services/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');


module.exports = {
    name: Events.UserUpdate,
    once: false,
    execute: async (oldUser, newUser) => {
        // Check if the event is loaded in the logging settings for this guild
        const client = newUser.client;
        const loggingSettings = client.loggingSettings.get(newUser.id);
        if (!loggingSettings || !loggingSettings.UserUpdate) return;

        const userChanges = [];

        if (oldUser.username !== newUser.username) {
            userChanges.push(
                `**Username**\n` +
                `Before: ${oldUser.username}\n` +
                `After: ${newUser.username}`
            );
        }

        if (oldUser.globalName !== newUser.globalName) {
            userChanges.push(
                `**Display Name**\n` +
                `Before: ${oldUser.globalName ?? 'None'}\n` +
                `After: ${newUser.globalName ?? 'None'}`
            );
        }

        if (oldUser.avatar !== newUser.avatar) {
            userChanges.push(`**Avatar changed**`);
        }

        if (userChanges.length === 0) return;

        const embed = new EmbedBuilder()
            .setTitle('User Update')
            .setDescription(userChanges.join('\n\n'))
            .setAuthor({ name: oldUser.username, iconURL: oldUser.displayAvatarURL() })
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        if (oldUser.avatar !== newUser.avatar) {
            embed.setImage(newUser.displayAvatarURL());
        }

        for (const guild of newUser.client.guilds.cache.values()) {
            let member;

            try {
                member = await guild.members.fetch(newUser.id);
            } catch {
                continue; // User is not in this guild or cannot be fetched
            }

            const modLogChannel = getModLogChannel(guild);
            if (!modLogChannel) continue;

            try {
                await modLogChannel.send({ embeds: [embed] });
            } catch (error) {
                consoleLog('error', `Failed to send user update log in ${guild.name}: ${error.message}`);
                writeLogToFile(`Failed to send user update log in ${guild.name}: ${error.message}`);
            }
        }
    }
}