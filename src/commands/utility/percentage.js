const { 
	SlashCommandBuilder, 
	EmbedBuilder, 
	MessageFlags,
	InteractionContextType,
	ApplicationIntegrationType
} = require('discord.js');

module.exports = {
	isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

	data: new SlashCommandBuilder()
		.setName('percentage')
		.setDescription('Calculates the percentage of a number.')
		.setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		])
		.addNumberOption(option =>
			option.setName('number')
				.setDescription('The number to calculate the percentage for.')
				.setRequired(true)
		)
		.addNumberOption(option =>
			option.setName('total')
				.setDescription('The total value.')
				.setRequired(true)
		)
        .addNumberOption(option =>
            option.setName('precision')
                .setDescription('The number of decimal places to round to (default is 2).')
                .setRequired(false)
        ),

	async execute(interaction) {
		const number = interaction.options.getNumber('number');
		const total = interaction.options.getNumber('total');
		const precision = interaction.options.getNumber('precision') || 2;

		if (total === 0) {
			return interaction.reply({
				content: 'The total value cannot be zero.',
				flags: MessageFlags.Ephemeral,
			});
		}

		const percentage = (number / total) * 100;

        const embed = new EmbedBuilder()
            .setDescription(`The percentage of **${number}** out of **${total}** is **${percentage.toFixed(precision)}%**.`)
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

		return interaction.reply({
			embeds: [embed],
		});
	},
};