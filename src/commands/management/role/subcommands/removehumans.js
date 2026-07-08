const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: subcommand =>
        subcommand
            .setName('removehumans')
            .setDescription('Remove a role from all humans.')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to remove from all humans.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        
    }
}