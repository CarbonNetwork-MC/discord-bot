const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: subcommand =>
        subcommand
            .setName('removein')
            .setDescription('Remove a role from all members currently in a role.')
            .addRoleOption(option =>
                option.setName('base_role')
                    .setDescription('The role to check for members currently in.')
                    .setRequired(true)
            )
            .addRoleOption(option =>
                option.setName('remove_role')
                    .setDescription('The role to remove from all members currently in the base role.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        
    }
}