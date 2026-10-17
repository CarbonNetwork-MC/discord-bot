const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    MessageFlags,
    ApplicationIntegrationType,
    InteractionContextType
} = require('discord.js');

const { consoleLog, writeLogToFile } = require('../../services/logger.js');
const { parseDurationToSeconds } = require('../../utils/timeFormatter.js');

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: [
        'BanMembers'
    ],

    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user from the server')
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
		])
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