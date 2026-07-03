const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
	isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

	data: new SlashCommandBuilder()
		.setName('chance')
		.setDescription('Calculates the chance of something happening based on a percentage input.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('from-percentage')
                .setDescription('Calculates the odds of an event happening based on a given percentage.')
                .addStringOption(option =>
                    option.setName('percentage')
                        .setDescription('The percentage chance (0-100) of the event happening.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('from-odds')
                .setDescription('Calculates the percentage chance of an event happening based on given odds.')
                .addStringOption(option =>
                    option.setName('odds')
                        .setDescription('The odds of the event happening (e.g., 1 in 10).')
                        .setRequired(true)
                )
        ),

	async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'from-percentage') {
            const percentageInput = interaction.options.getString('percentage');
            const percentage = parseFloat(percentageInput);

            if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                return interaction.reply({ 
                    content: 'Please provide a valid percentage between 0 and 100.', 
                    flags: MessageFlags.Ephemeral 
                });
            }

            const odds = 100 / percentage;
            const formattedPercentage = percentage < 0.01
                ? percentage.toFixed(4)
                : percentage.toFixed(2);
            const formattedOdds = odds < 0.01
                ? odds.toFixed(4)
                : odds.toFixed(2);
            
            const embed = new EmbedBuilder()
                .setTitle('Chance Calculation')
                .setDescription(`The chance of this event happening is **${formattedPercentage}%**.\nThis means it will happen approximately **1 in ${formattedOdds} times**.`)
                .setColor(process.env.COLOR_BLUE)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            await interaction.reply({ 
                embeds: [embed]
            });
        } else if (subcommand === 'from-odds') {
            const oddsInput = interaction.options.getString('odds');
            const oddsMatch = oddsInput.match(/^(\d+(?:\.\d+)?)\s*in\s*(\d+(?:\.\d+)?)$/i);
            if (!oddsMatch) {
                return interaction.reply({
                    content: 'Please provide valid odds in the format "X in Y".',
                    flags: MessageFlags.Ephemeral
                });
            }

            const [_, x, y] = oddsMatch;
            const percentage = (parseFloat(x) / parseFloat(y)) * 100;
            const formattedPercentage = percentage < 0.01
                ? percentage.toFixed(4)
                : percentage.toFixed(2);

            const embed = new EmbedBuilder()
                .setTitle('Chance Calculation')
                .setDescription(`The odds of this event happening are **${x} in ${y}**.\nThis means it has a **${formattedPercentage}%** chance of occurring.`)
                .setColor(process.env.COLOR_BLUE)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            await interaction.reply({
                embeds: [embed]
            });
        }
	},
};