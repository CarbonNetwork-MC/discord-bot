const { 
    SlashCommandBuilder, 
    EmbedBuilder,
    MessageFlags,
    InteractionContextType, 
    ApplicationIntegrationType 
} = require('discord.js');

const reminderTimers = require('../../services/reminderTimers.js');

module.exports = {
	isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

	data: new SlashCommandBuilder()
		.setName('reminder')
		.setDescription('Set a reminder for yourself')
		.setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		])
        .addStringOption(option =>
            option.setName('time')
                .setDescription('The time to set the reminder for (e.g., 10m, 2h, 1d)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to remind you of')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('destination')
                .setDescription('Where to send the reminder')
                .addChoices(
                    { name: 'In this channel (default)', value: 'public' },
                    { name: 'In your DMs', value: 'dm' }
                )
                .setRequired(false)
        ),
		
	async execute(interaction) {
		const timeInput = interaction.options.getString('time');
        const message = interaction.options.getString('message');
        const destination = interaction.options.getString('destination') || 'public';

        const client = interaction.client;
        const reminder = await reminderTimers.createReminder(client, {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            timeInput,
            message,
            destination,
        });

        const reminderTime = new Date(reminder.remind_at);

        // Embed
        const embed = new EmbedBuilder()
            .setTitle(':alarm_clock: Reminder Set!')
            .setDescription(`Your reminder has been set for <t:${Math.floor(reminderTime.getTime() / 1000)}:F>.\n\n**Message:** ${reminder.message}`)
            .setColor(process.env.COLOR_GREEN)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
        });
	},
};