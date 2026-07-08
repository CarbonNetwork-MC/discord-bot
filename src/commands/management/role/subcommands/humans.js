const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: subcommand =>
        subcommand
            .setName('humans')
            .setDescription('Add a role to all humans.')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to add to all humans.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        
    }
}