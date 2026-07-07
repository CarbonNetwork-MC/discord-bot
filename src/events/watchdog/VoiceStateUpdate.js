const { Events, EmbedBuilder } = require('discord.js');
const { consoleLog, writeLogToFile } = require('../../services/logger.js');

const {
    WATCHDOG_ENABLED,
    WATCHDOG_OUTPUT_TYPE,
    WATCHDOG_OUTPUT_ID,
    OWNER_ID,
    COLOR_GREEN,
    COLOR_RED,
    COLOR_BLUE,
    EMBED_FOOTER,
} = process.env;

function logError(message) {
    consoleLog('error', message);
    writeLogToFile('error', message);
}

async function sendWatchdogEmbed(client, embed) {
    try {
        switch (WATCHDOG_OUTPUT_TYPE) {
            case 'dm': {
                const user = await client.users.fetch(WATCHDOG_OUTPUT_ID);
                await user.send({ embeds: [embed] });
                break;
            }

            case 'channel': {
                const channel = await client.channels.fetch(WATCHDOG_OUTPUT_ID);

                if (!channel?.isTextBased()) {
                    throw new Error(`Channel ${WATCHDOG_OUTPUT_ID} is not text-based or was not found.`);
                }

                await channel.send({ embeds: [embed] });
                break;
            }

            case 'webhook': {
                const webhook = await client.fetchWebhook(WATCHDOG_OUTPUT_ID);
                await webhook.send({ embeds: [embed] });
                break;
            }

            default:
                throw new Error(
                    `Invalid WATCHDOG_OUTPUT_TYPE: ${WATCHDOG_OUTPUT_TYPE}. Must be dm, channel, or webhook.`
                );
        }
    } catch (error) {
        logError(`Error sending voice state update log: ${error.message}`);
    }
}

function createVoiceEmbed({ title, description, user, color }) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(`${description}\n\nSent by **Watchdog**`)
        .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL(),
        })
        .setColor(color)
        .setFooter({ text: EMBED_FOOTER })
        .setTimestamp();
}

module.exports = {
    name: Events.VoiceStateUpdate,
    once: false,

    async execute(oldState, newState) {
        if (WATCHDOG_ENABLED !== 'true') return;

        const client = newState.client;
        const settings = client.watchDogSettings;

        // Check if the guild is in the monitored servers list
        const monitoredServers = settings.getEnabledGuilds();
        if (!monitoredServers.includes(newState.guild.id)) return;

        // Check if the guild has voice state update logging enabled
        if (!settings.isEnabled(newState.guild.id, 'VoiceStateUpdate')) return;

        const user = newState.member?.user ?? oldState.member?.user;
        if (!user) return;

        if (user.id === OWNER_ID) return;

        let embed;

        if (!oldState.channelId && newState.channelId) {
            embed = createVoiceEmbed({
                title: ':telephone_receiver: Member joined a voice channel',
                description: `**<@${user.id}>** joined <#${newState.channelId}>`,
                user,
                color: COLOR_GREEN,
            });
        } else if (oldState.channelId && !newState.channelId) {
            embed = createVoiceEmbed({
                title: ':man_running: Member left a voice channel',
                description: `**<@${user.id}>** left <#${oldState.channelId}>`,
                user,
                color: COLOR_RED,
            });
        } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            embed = createVoiceEmbed({
                title: ':left_right_arrow: Member switched voice channels',
                description: `**<@${user.id}>** switched voice channels\n**Before:** <#${oldState.channelId}>\n**After:** <#${newState.channelId}>`,
                user,
                color: COLOR_BLUE,
            });
        } else {
            return;
        }

        await sendWatchdogEmbed(newState.client, embed);
    },
};
