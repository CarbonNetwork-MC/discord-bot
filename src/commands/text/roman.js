const { 
    SlashCommandBuilder, 
    EmbedBuilder,
    InteractionContextType,
    ApplicationIntegrationType
} = require('discord.js');

module.exports = {
	isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

	data: new SlashCommandBuilder()
		.setName('roman')
		.setDescription('Converts a number to Roman numerals and vice versa.')
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		])
        .addSubcommand(subcommand => 
            subcommand
            .setName('to-roman')
            .setDescription('Converts a number to Roman numerals.')
            .addIntegerOption(option =>
                option.setName('number')
                    .setDescription('The number to convert to Roman numerals.')
                    .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('from-roman')
            .setDescription('Converts Roman numerals to a number.')
            .addStringOption(option =>
                option.setName('roman')
                    .setDescription('The Roman numerals to convert to a number.')
                    .setRequired(true)
            )
        ),

	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'to-roman') {
            const number = interaction.options.getInteger('number');
            const romanNumeral = convertToRoman(number);

            const embed = new EmbedBuilder()
                .addFields(
                    { name: 'Number', value: `\`${number}\``, inline: true },
                    { name: 'Roman Numeral', value: `\`${romanNumeral}\``, inline: true }
                )
                .setColor(process.env.COLOR_BLUE)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            await interaction.reply({ 
                embeds: [embed] 
            });
        } else if (subcommand === 'from-roman') {
            const roman = interaction.options.getString('roman').toUpperCase();
            const number = convertFromRoman(roman);

            const embed = new EmbedBuilder()
                .addFields(
                    { name: 'Roman Numeral', value: `\`${roman}\``, inline: true },
                    { name: 'Number', value: `\`${number}\``, inline: true }
                )
                .setColor(process.env.COLOR_BLUE)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            await interaction.reply({ 
                embeds: [embed] 
            });
        }
    },
};

function convertToRoman(num) {
    if (num < 1 || num > 3999) return 'Invalid number. Please enter a number between 1 and 3999.';
    const romanNumerals = [
        { value: 1000, numeral: 'M' },
        { value: 900, numeral: 'CM' },
        { value: 500, numeral: 'D' },
        { value: 400, numeral: 'CD' },
        { value: 100, numeral: 'C' },
        { value: 90, numeral: 'XC' },
        { value: 50, numeral: 'L' },
        { value: 40, numeral: 'XL' },
        { value: 10, numeral: 'X' },
        { value: 9, numeral: 'IX' },
        { value: 5, numeral: 'V' },
        { value: 4, numeral: 'IV' },
        { value: 1, numeral: 'I' }
    ];

    let result = '';
    for (const { value, numeral } of romanNumerals) {
        while (num >= value) {
            result += numeral;
            num -= value;
        }
    }
    return result;
}

function convertFromRoman(roman) {
    const romanNumerals = {
        'I': 1,
        'V': 5,
        'X': 10,
        'L': 50,
        'C': 100,
        'D': 500,
        'M': 1000
    };

    let result = 0;
    for (let i = 0; i < roman.length; i++) {
        const current = romanNumerals[roman[i]];
        const next = romanNumerals[roman[i + 1]];

        if (next && current < next) {
            result += next - current;
            i++;
        } else {
            result += current;
        }
    }
    return result;
}
