const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    MessageFlags,
    ApplicationIntegrationType,
    InteractionContextType
} = require('discord.js');

module.exports = {
    isDev: false,
    servers: [
        '1203116259693301830', // Carbon Network
    ],
    allowedUsers: null,
    requiredPermissions: null,

    data: new SlashCommandBuilder()
        .setName('fw')
        .setDescription('Calculate the order of wards for the boss battle in Forewarned')
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		])
        .addStringOption(option =>
            option
                .setName('mode')
                .setDescription('Sorting mode')
                .setRequired(true)
                .addChoices(
                    { name: 'Alphabetical', value: 'alpha' },
                    { name: 'Reverse Alphabetical', value: 'alpha_rev' },
                    { name: 'Numerical', value: 'num' },
                    { name: 'Reverse Numerical', value: 'num_rev' }
                )
        )
        .addStringOption(option =>
            option.setName('lv').setDescription('LV (letter or number)').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('la').setDescription('LA (letter or number)').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('rv').setDescription('RV (letter or number)').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('ra').setDescription('RA (letter or number)').setRequired(true)
        ),

    async execute(interaction) {
        const mode = interaction.options.getString('mode');
        const modeNames = {
            'alpha': 'Alphabetical',
            'alpha_rev': 'Reverse Alphabetical', 
            'num': 'Numerical',
            'num_rev': 'Reverse Numerical'
        };
        const modeName = modeNames[mode];

        const wards = [
            { key: 'LV', value: interaction.options.getString('lv').trim() },
            { key: 'LA', value: interaction.options.getString('la').trim() },
            { key: 'RV', value: interaction.options.getString('rv').trim() },
            { key: 'RA', value: interaction.options.getString('ra').trim() },
        ];

        const values = wards.map(w => w.value);

        const isNumeric = values.every(v => !isNaN(v));
        const isAlpha = values.every(v => /^[a-zA-Z]$/.test(v));

        if (!isNumeric && !isAlpha) {
            return interaction.reply({
                content: 'All wards must be **either letters (A–Z)** or **numbers**, not mixed.',
                flags: MessageFlags.Ephemeral,
            });
        }

        if (isNumeric && mode.startsWith('alpha')) {
            return interaction.reply({
                content: 'Alphabetical sorting cannot be used with numeric wards.',
                flags: MessageFlags.Ephemeral,
            });
        }

        if (isAlpha && mode.startsWith('num')) {
            return interaction.reply({
                content: 'Numerical sorting cannot be used with letter wards.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const sorted = wards.sort((a, b) => {
            if (isNumeric) {
                return Number(a.value) - Number(b.value);
            }
            return a.value.toUpperCase().localeCompare(b.value.toUpperCase());
        });

        if (mode.endsWith('_rev')) {
            sorted.reverse();
        }

        const order = sorted.map(w => w.key).join(' → ');

        const embed = new EmbedBuilder()
            .setTitle('Forewarned – Ward Order')
            .addFields(
                { name: 'Sorting Mode', value: modeName },
                { name: 'Order', value: order }
            )
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};