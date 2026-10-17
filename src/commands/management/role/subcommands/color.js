const { EmbedBuilder, MessageFlags } = require("discord.js");

const { consoleLog, writeLogToFile } = require('../../../../services/logger.js');

module.exports = {
    data: subcommand =>
        subcommand
            .setName('color')
            .setDescription('Change the color of a role.')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to change the color of.')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('color')
                    .setDescription('The new color of the role (hex code).')
                    .setRequired(true)
            ),

    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const color = interaction.options.getString('color');

        try {
            const colors = {
                primaryColor: color || 0x000000,
            }

            await role.edit({ colors: colors });

            const embed = new EmbedBuilder()
                .setTitle('Role Color Changed')
                .setDescription(`Successfully changed the color of the role **${role.name}** to **${color}**.`)
                .setColor(role.color || 0x00FF00)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            await interaction.reply({ 
                embeds: [embed], 
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            consoleLog('error', `Error changing role color: ${error.message}`);
            writeLogToFile('error', `Error changing role color: ${error.message}`);
            await interaction.reply({ 
                content: 'There was an error while changing the role color.', 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
}