const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const maxLength = 30;
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const extraCharacters = ' !@#$&*_-?';

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Generates random data based on the specified type.')
        .addSubcommand(subcommand => 
            subcommand.setName('number')
                .setDescription('Generates a random number between the specified min and max values.')
                .addIntegerOption(option =>
                    option.setName('min')
                        .setDescription('The minimum value for the random number. (default: 0)')
                        .setRequired(false)
                )
                .addIntegerOption(option =>
                    option.setName('max')
                        .setDescription('The maximum value for the random number. (default: 100)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('string')
                .setDescription('Generates a random string of the specified length.')
                .addIntegerOption(option =>
                    option.setName('length')
                        .setDescription('The length of the random string. (default: 10, max: 30)')
                        .setRequired(false)
                )
                .addBooleanOption(option =>
                    option.setName('include_special_characters')
                        .setDescription('Whether to include special characters in the random string. (default: false)')
                        .setRequired(false)
                )
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'number') {
            const min = interaction.options.getInteger('min') ?? 0;
            const max = interaction.options.getInteger('max') ?? 100;

            if (min > max) {
                return interaction.reply({ content: 'The minimum value cannot be greater than the maximum value.', ephemeral: true });
            }

            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            const embed = new EmbedBuilder()
                .setTitle('Random Number')
                .setDescription(`Generated random number between ${min} and ${max}: **${randomNumber}**`)
                .setColor(process.env.COLOR_BLUE)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'string') {
            const length = interaction.options.getInteger('length') ?? 10;
            if (length < 1 || length > maxLength) {
                return interaction.reply({ 
                    content: `The length must be between 1 and ${maxLength}.`, 
                    ephemeral: true 
                });
            }

            const includeSpecialCharacters = interaction.options.getBoolean('include_special_characters') ?? false;
            let newCharacters = characters;
            if (includeSpecialCharacters) {
                newCharacters += extraCharacters;
            }
            let randomString = '';
            for (let i = 0; i < length; i++) {
                randomString += newCharacters.charAt(Math.floor(Math.random() * newCharacters.length));
            }
            const embed = new EmbedBuilder()
                .setTitle('Random String')
                .setDescription(`Generated random string of length ${length}: **${randomString}**`)
                .setColor(process.env.COLOR_BLUE)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }
    }
}
