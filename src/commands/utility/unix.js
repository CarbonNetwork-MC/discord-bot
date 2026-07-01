const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

    data: new SlashCommandBuilder()
        .setName("unix")
        .setDescription("Converts a unix timestamp to a human-readable date and time and vice versa.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("to-unix")
                .setDescription("Converts a human-readable date and time to a unix timestamp.")
                .addStringOption(option =>
                    option
                        .setName("date")
                        .setDescription("The date and time to convert to a unix timestamp. Format: DD-MM-YYYY HH:MM:SS")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("from-unix")
                .setDescription("Converts a unix timestamp to a human-readable date and time.")
                .addStringOption(option =>
                    option
                        .setName("timestamp")
                        .setDescription("The unix timestamp to convert to a human-readable date and time.")
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "to-unix") {
            const dateString = interaction.options.getString("date");
            let date = new Date(dateString);

            if (isNaN(date.getTime()) && dateString !== "now") {
                return interaction.reply({
                    content: "Invalid date format. Please use the format: DD-MM-YYYY HH:MM:SS",
                    flags: MessageFlags.Ephemeral,
                });
            }

            if (dateString === "now") {
                date = new Date();
            }

            const unixTimestamp = Math.floor(date.getTime() / 1000);
            const embed = new EmbedBuilder()
                .setDescription(`The unix timestamp for \`${dateString}\` is: \n\`${unixTimestamp}\``)
                .setColor(process.env.COLOR_BLUE)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            return interaction.reply({ 
                embeds: [embed] 
            });
        } else if (subcommand === "from-unix") {
            const timestampString = interaction.options.getString("timestamp");
            const timestamp = parseInt(timestampString, 10);

            if (isNaN(timestamp)) {
                return interaction.reply({
                    content: "Invalid unix timestamp. Please provide a valid number.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            const date = new Date(timestamp * 1000);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

            const embed = new EmbedBuilder()
                .setDescription(`The date and time for the unix timestamp \`${timestamp}\` is: \n\`${formattedDate}\``)
                .setColor(process.env.COLOR_BLUE)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            return interaction.reply({ 
                embeds: [embed] 
            });
        }
    }
}
