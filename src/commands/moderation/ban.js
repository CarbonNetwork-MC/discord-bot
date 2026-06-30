const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const { consoleLog, writeLogToFile } = require('../../services/logger.js');

function parseDurationToSeconds(input) {
    if (!input) return 0;

    const value = input.trim().toLowerCase();

    if (/^\d+$/.test(value)) {
        return Number(value); // raw seconds
    }

    const match = value.match(/^(\d+)\s*(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days)$/);

    if (!match) return null;

    const amount = Number(match[1]);
    const unit = match[2];

    const multipliers = {
        s: 1,
        sec: 1,
        secs: 1,
        second: 1,
        seconds: 1,
        m: 60,
        min: 60,
        mins: 60,
        minute: 60,
        minutes: 60,
        h: 3600,
        hr: 3600,
        hrs: 3600,
        hour: 3600,
        hours: 3600,
        d: 86400,
        day: 86400,
        days: 86400,
    };

    return amount * multipliers[unit];
}

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: ['BanMembers'],
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user from the server')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the ban')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('The duration of the ban (e.g., 1d, 2h, 30m)')
                .setRequired(false)
        ),
    async execute(interaction) {
        // Fetch the user and reason from the command options
        const user = interaction.options.getUser('target');
        const reasonInput = interaction.options.getString('reason') || 'No reason provided';
        const moderator = interaction.user;

        const durationInput = interaction.options.getString('duration');
        const duration = parseDurationToSeconds(durationInput);
        
        const reason = `${reasonInput} | Banned by: ${moderator.id} | Deleted messages: ${duration}s`;

        // Validate the duration
        if (duration == null) {
            const embed = new EmbedBuilder()
                .setTitle(':x: Invalid duration')
                .setDescription(
                    `The duration "${durationInput}" is invalid. Please use a valid format like "1d", "2h", "30m", or just a number for seconds.`
                )
                .setColor(process.env.COLOR_RED)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            await interaction.reply({ 
                embeds: [embed], 
                flags: MessageFlags.Ephemeral 
            });

            return;
        }

        if (duration < 0 || duration > 604800) {
            const embed = new EmbedBuilder()
                .setTitle(':x: Invalid duration')
                .setDescription(
                    `The duration must be between 0 seconds and 7 days (604800 seconds).`
                )
                .setColor(process.env.COLOR_RED)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            await interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        // Attempt to ban the user
        try {
            await interaction.guild.members.ban(user, { 
                reason: reason,
                deleteMessageSeconds: duration
            });

            const embed = new EmbedBuilder()
                .setTitle(':no_entry: User banned')
                .setDescription(
                    `**User:** ${user.tag} (<@${user.id}>)\n` +
                    `**ID:** ${user.id}\n` +
                    `**Reason:** ${reasonInput}`
                )
                .setColor(process.env.COLOR_RED)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            await interaction.reply({ 
                embeds: [embed],
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            consoleLog('error', `Failed to ban ${user.tag}: ${error}`);
            writeLogToFile('error', `Failed to ban ${user.tag}: ${error}`);
            
            const embed = new EmbedBuilder()
                .setTitle(':x: Ban failed')
                .setDescription(
                    `Failed to ban user ${user.tag} (<@${user.id}>).\n` +
                    `**Error:** ${error.message}`
                )
                .setColor(process.env.COLOR_RED)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            await interaction.reply({ 
                embeds: [embed], 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
}