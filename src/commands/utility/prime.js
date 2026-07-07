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
		.setName('prime')
		.setDescription('Checks if a number is prime.')
		.setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		])
		.addNumberOption(option =>
			option.setName('number')
				.setDescription('The number to check.')
				.setRequired(true)
		),

	async execute(interaction) {
		const number = interaction.options.getNumber('number');

		if (number < 2) {
			return interaction.reply({
				content: 'Numbers less than 2 are not prime.',
				flags: MessageFlags.Ephemeral,
			});
		}

        let embed = new EmbedBuilder()
            .setTitle(`Prime Number Check`)
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

		for (let i = 2; i <= Math.sqrt(number); i++) {
			if (number % i === 0) {
                embed.setDescription(`**${number}** is not a prime number. It is divisible by **${i}**.`);

				return interaction.reply({
					embeds: [embed],
				});
			}
		}

        embed.setDescription(`**${number}** is a prime number.`);
		return interaction.reply({
			embeds: [embed],
		});
	},
};