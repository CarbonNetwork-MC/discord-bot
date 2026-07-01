const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
	isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

	data: new SlashCommandBuilder()
		.setName('factor')
		.setDescription('Calculates the factors of a given number.')
		.addIntegerOption(option =>
			option.setName('number')
				.setDescription('The number to calculate factors for.')
				.setRequired(true)
		),

	async execute(interaction) {
		const number = interaction.options.getInteger('number');
		if (number <= 0) {
			return interaction.reply({ 
				content: 'Please provide a positive integer.', 
				flags: MessageFlags.Ephemeral 
			});
		}

		const factors = [];
		for (let i = 1; i <= number; i++) {
			if (number % i === 0) {
				factors.push(i);
			}
		}

		const embed = new EmbedBuilder()
			.setTitle('Factor Calculator')
			.setDescription(`The factors of **${number}** are: ${factors.join(', ')}`)
			.setColor(process.env.COLOR_BLUE)
			.setFooter({ text: process.env.EMBED_FOOTER })
			.setTimestamp();

		await interaction.reply({ 
            embeds: [embed] 
        });
	},
};