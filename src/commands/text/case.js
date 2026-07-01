const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,
    data: new SlashCommandBuilder()
        .setName("case")
        .setDescription("Converts text to a specified case.")
        .addStringOption((option) =>
            option
                .setName("case")
                .setDescription("The case to convert the text to.")
                .setRequired(true)
                .addChoices(
                    { name: "Uppercase", value: "upper" },
                    { name: "Lowercase", value: "lower" },
                    { name: "Capitalized", value: "capitalized" },
                    { name: "Camel Case", value: "camel" },
                    { name: "Pascal Case", value: "pascal" },
                    { name: "Snake Case", value: "snake" },
                    { name: "Kebab Case", value: "kebab" },
                    { name: "Title Case", value: "title" },
                    { name: "Sentence Case", value: "sentence" }
                )
            )
        .addStringOption((option) =>
            option
                .setName("input")
                .setDescription("The text to convert.")
                .setRequired(true)
        ),
    async execute(interaction) {
        const caseType = interaction.options.getString("case");
        const inputText = interaction.options.getString("input");

        let outputText;

        switch (caseType) {
            case "upper":
                outputText = inputText.toUpperCase();
                break;
            case "lower":
                outputText = inputText.toLowerCase();
                break;
            case "capitalized":
                outputText = inputText
                    .toLowerCase()
                    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
                break;
            case "camel":
                outputText = inputText
                    .toLowerCase()
                    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
                break;
            case "pascal":
                outputText = inputText
                    .toLowerCase()
                    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
                    .replace(/\s+/g, '');
                break;
            case "snake":
                outputText = inputText
                    .toLowerCase()
                    .replace(/\s+/g, '_');
                break;
            case "kebab":
                outputText = inputText
                    .toLowerCase()
                    .replace(/\s+/g, '-');
                break;
            case "title":
                outputText = inputText
                    .toLowerCase()
                    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
                break;
            case "sentence":
                outputText = inputText
                    .toLowerCase()
                    .replace(/(^\w|\.\s\w)/g, (m) => m.toUpperCase());
                break;
        }

        const embed = new EmbedBuilder()
            .setTitle("Case Conversion Result")
            .addFields(
                { name: "Input Text", value: inputText },
                { name: "Converted Text", value: outputText }
            )
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        await interaction.reply({ 
            embeds: [embed] 
        });
    }
}
