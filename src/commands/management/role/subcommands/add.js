const { EmbedBuilder, MessageFlags } = require("discord.js");

const { consoleLog, writeLogToFile } = require('../../../../services/logger.js');

module.exports = {
    data: subcommand =>
        subcommand
            .setName('add')
            .setDescription('Add a role to a user.')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to add the role to.')
                    .setRequired(true)
            )
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to add.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');

        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.roles.add(role);

            const embed = new EmbedBuilder()
                .setTitle('Role Added')
                .setDescription(`Successfully added the role ${role} to ${user}.`)
                .setColor(process.env.COLOR_GREEN)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            return interaction.reply({ 
                embeds: [embed],
            });
        } catch (err) {
            consoleLog('error', `Error adding role: ${err}`);
            writeLogToFile('error', `Error adding role: ${err}`);
            return interaction.reply({ 
                content: 'There was an error while adding the role.', 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
}