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
        .setName("base64")
        .setDescription("Encodes or decodes text to/from Base64")
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		])
        .addStringOption((option) =>
            option
                .setName("input")
                .setDescription("The text to encode or decode")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("mode")
                .setDescription("Choose whether to encode or decode the input")
                .setRequired(true)
                .addChoices(
                    { name: "Encode", value: "encode" },
                    { name: "Decode", value: "decode" }
                )
        ),

    async execute(interaction) {
        const input = interaction.options.getString("input");
        const mode = interaction.options.getString("mode");

        let result;
        if (mode === "encode") {
            result = Buffer.from(input, "utf-8").toString("base64");
        } else if (mode === "decode") {
            try {
                result = Buffer.from(input, "base64").toString("utf-8");
            } catch (error) {
                return interaction.reply({
                    content: "Invalid Base64 input.",
                    flags: MessageFlags.Ephemeral,
                });
            }
        } else {
            return interaction.reply({
                content: "Invalid mode. Please choose 'encode' or 'decode'.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Base64 ${mode.charAt(0).toUpperCase() + mode.slice(1)}`)
            .setDescription(`**Result:** \n\`${result}\``)
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        return interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
        });
    }
}
