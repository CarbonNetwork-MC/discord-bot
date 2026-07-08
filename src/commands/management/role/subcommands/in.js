const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: subcommand =>
        subcommand
            .setName('in')
            .setDescription('Add a role to all members currently in a role.')
            .addRoleOption(option =>
                option.setName('base_role')
                    .setDescription('The role to check for members currently in.')
                    .setRequired(true)
            )
            .addRoleOption(option =>
                option.setName('new_role')
                    .setDescription('The role to add to all members currently in the base role.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        
    }
}