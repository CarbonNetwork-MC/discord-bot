const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

const { formatTimeDifference } = require("../../utils/timeFormatter.js");

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

    data: new SlashCommandBuilder()
        .setName("countdown")
        .setDescription("See a countdown to a specific date.")
        .addStringOption(option =>
            option.setName("date")
                .setDescription("The date to count down to (DD-MM-YYYY HH:mm).")
                .setRequired(true)
        ),

    async execute(interaction) {
        const dateInput = interaction.options.getString("date");

        // Validate the date format (DD-MM-YYYY HH:mm)
        const dateRegex = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/;
        const match = dateInput.match(dateRegex);

        if (!match) {
            return interaction.reply({ 
                content: "Invalid date format. Please use DD-MM-YYYY HH:mm.", 
                flags: MessageFlags.Ephemeral
            });
        }

        const [_, day, month, year, hours, minutes] = match;
        const targetDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);

        const now = new Date();
        const timeDifference = targetDate - now;

        if (timeDifference <= 0) {
            return interaction.reply({ 
                content: "The specified date is in the past. Please provide a future date.", 
                flags: MessageFlags.Ephemeral
            });
        }

        const formattedTime = formatTimeDifference(timeDifference);

        const embed = new EmbedBuilder()
            .setTitle("Countdown")
            .setDescription(`Time remaining until **${dateInput}**: \n**${formattedTime}** \n\n<t:${Math.floor(targetDate.getTime() / 1000)}:R>`)
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}
