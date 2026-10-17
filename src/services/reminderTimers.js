const { EmbedBuilder, MessageFlags } = require('discord.js');

const ReminderRepository = require('../repositories/RemindersRepository.js');

const scheduledReminderIds = new Set();

function getScheduledReminderIds() {
    return scheduledReminderIds;
}

function addReminderToSchedule(reminderId) {
    if (scheduledReminderIds.has(reminderId)) return;

    scheduledReminderIds.add(reminderId);
}

function parseTimeInput(input) {
    const match = input.match(/^(\d+)(s|m|h|d)$/i);

    if (!match) {
        throw new Error('Invalid time format. Please use a number followed by s, m, h, or d (e.g., 10s, 5m, 2h, 1d).');
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return amount * multipliers[unit];
}

async function createReminder(client, { userId, guildId, channelId, timeInput, message, displayOption }) {
    const delay = parseTimeInput(timeInput);
    const remindAt = new Date(Date.now() + delay);

    // Store the reminder in a database
    const reminder = await ReminderRepository.create({
        userId,
        guildId,
        channelId,
        message,
        displayOption,
        remindAt,
    });

    console.log('Reminder created');

    scheduleReminder(client, reminder);

    return reminder;
}

async function sendReminder(client, reminder) {
    const userId = reminder.userId ?? reminder.user_id;
    const channelId = reminder.channelId ?? reminder.channel_id;
    const message = reminder.message;
    const displayOption = reminder.displayOption ?? reminder.display_option ?? 'public';

    const user = await client.users.fetch(userId);

    const embed = new EmbedBuilder()
        .setTitle(':alarm_clock: Reminder')
        .setDescription(`<@${userId}>, here is your reminder:\n\n${message}`)
        .setColor(process.env.COLOR_BLUE)
        .setFooter({ text: process.env.EMBED_FOOTER })
        .setTimestamp();

    if (displayOption === 'dm') {
        await user.send({ embeds: [embed] });
    } else if (displayOption === 'public') {
        const channel = await client.channels.fetch(channelId);
        if (!channel) return;

        await channel.send({ 
            content: `<@${userId}>`, 
            embeds: [embed] 
        });
    }

    await ReminderRepository.markCompleted(reminder.id);
}

function scheduleReminder(client, reminder) {
    if (scheduledReminderIds.has(reminder.id)) return;

    scheduledReminderIds.add(reminder.id);

    const delay = new Date(reminder.remind_at).getTime() - Date.now();

    setTimeout(async () => {
        try {
            await sendReminder(client, reminder);
        } finally {
            scheduledReminderIds.delete(reminder.id);
        }
    }, Math.max(delay, 0));
}

module.exports = {
    getScheduledReminderIds,
    addReminderToSchedule,
    createReminder,
    sendReminder,
    scheduleReminder,
}
