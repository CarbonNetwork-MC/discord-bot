const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    MessageFlags,
    InteractionContextType,
    ApplicationIntegrationType
} = require("discord.js");

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

    data: new SlashCommandBuilder()
        .setName("base")
        .setDescription("Convert between binary, decimal and hexadecimal.")
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		])
        .addStringOption(option =>
            option
                .setName("value")
                .setDescription("The value to convert")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("from")
                .setDescription("Source base")
                .setRequired(true)
                .addChoices(
                    { name: "Binary", value: "bin" },
                    { name: "Decimal", value: "dec" },
                    { name: "Hexadecimal", value: "hex" }
                )
        )
        .addStringOption(option =>
            option
                .setName("to")
                .setDescription("Target base")
                .setRequired(true)
                .addChoices(
                    { name: "Binary", value: "bin" },
                    { name: "Decimal", value: "dec" },
                    { name: "Hexadecimal", value: "hex" }
                )
        ),

    async execute(interaction) {
        const value = interaction.options.getString("value").trim();
        const from = interaction.options.getString("from");
        const to = interaction.options.getString("to");

        const bases = {
            bin: 2,
            dec: 10,
            hex: 16
        };

        try {
            const decimalValue = parseInt(value, bases[from]);

            const validators = {
                bin: /^[01]+$/,
                dec: /^\d+$/,
                hex: /^[0-9A-Fa-f]+$/
            };

            if (!validators[from].test(value)) {
                return interaction.reply({
                    content: `:x: "${value}" is not a valid ${from.toUpperCase()} value.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            if (isNaN(decimalValue)) {
                return interaction.reply({
                    content: ":x: Invalid value for the selected base.",
                    flags: MessageFlags.Ephemeral
                });
            }

            let result;

            switch (to) {
                case "bin":
                    result = decimalValue.toString(2);
                    break;
                case "dec":
                    result = decimalValue.toString(10);
                    break;
                case "hex":
                    result = decimalValue.toString(16).toUpperCase();
                    break;
            }

            const embed = new EmbedBuilder()
                .setTitle("Base Conversion")
                .addFields(
                    {
                        name: "Input",
                        value: `\`${value}\` (${from.toUpperCase()})`,
                        inline: true
                    },
                    {
                        name: "Output",
                        value: `\`${result}\` (${to.toUpperCase()})`,
                        inline: true
                    }
                );

            await interaction.reply({
                embeds: [embed]
            });

        } catch {
            await interaction.reply({
                content: ":x: Failed to convert value.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};