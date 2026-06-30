const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const { consoleLog, writeLogToFile } = require('../../services/logger.js');

module.exports = {
    isDev: false,
    servers: null,
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans a user from the server')
        .addStringOption(option => 
            option.setName('target')
                .setDescription('The ID of the user to unban')
                .setRequired(true)
        ),
    async execute(interaction) {
        // Fetch the user ID from the command options
        const userId = interaction.options.getString('target');

        // Attempt to unban the user
        try {
            await interaction.guild.members.unban(userId);

            const embed = new EmbedBuilder()
                .setTitle(':white_check_mark: User unbanned')
                .setDescription(`Successfully unbanned user with ID: ${userId}`)
                .setColor(process.env.COLOR_GREEN)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            await interaction.reply({ 
                embeds: [embed],
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            consoleLog('error', `Failed to unban user with ID ${userId}: ${error}`);
            writeLogToFile('error', `Failed to unban user with ID ${userId}: ${error}`);

            const embed = new EmbedBuilder()
                .setTitle(':x: Unban failed')
                .setDescription(
                    `Failed to unban user with ID: ${userId}.\n` +
                    `**Error:** ${error.message}`
                )
                .setColor(process.env.COLOR_RED)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            await interaction.reply({ 
                embeds: [embed], 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
}