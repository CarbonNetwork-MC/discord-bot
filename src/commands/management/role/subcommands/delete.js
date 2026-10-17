const { EmbedBuilder, MessageFlags } = require("discord.js");

const { consoleLog, writeLogToFile } = require('../../../../services/logger.js');

module.exports = {
    data: subcommand =>
        subcommand
            .setName('delete')
            .setDescription('Delete a role from the server.')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to delete.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        const role = interaction.options.getRole('role');

        try {
            await role.delete();

            const embed = new EmbedBuilder()
                .setTitle('Role Deleted')
                .setDescription(`Successfully deleted the role **${role.name}**.`)
                .setColor(0xFF0000)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            consoleLog('error', `Error deleting role: ${error.message}`);
            writeLogToFile('error', `Error deleting role: ${error.message}`);
            return interaction.reply({
                content: 'There was an error while deleting the role.',
                flags: MessageFlags.Ephemeral,
            });
        }
    }
}