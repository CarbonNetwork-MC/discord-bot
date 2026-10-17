const { EmbedBuilder, MessageFlags } = require("discord.js");

const { consoleLog, writeLogToFile } = require('../../../../services/logger.js');

module.exports = {
    data: subcommand =>
        subcommand
            .setName('remove')
            .setDescription('Remove a role from a user.')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to remove the role from.')
                    .setRequired(true)
            )
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to remove.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');

        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.roles.remove(role);

            const embed = new EmbedBuilder()
                .setTitle('Role Removed')
                .setDescription(`Successfully removed the role ${role} from ${user}.`)
                .setColor(process.env.COLOR_RED)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            return interaction.reply({ 
                embeds: [embed],
            });
        } catch (err) {
            consoleLog('error', `Error removing role: ${err}`);
            writeLogToFile('error', `Error removing role: ${err}`);
            return interaction.reply({ 
                content: 'There was an error while removing the role.', 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
}