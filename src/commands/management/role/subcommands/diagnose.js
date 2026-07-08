const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: subcommand =>
        subcommand
            .setName('diagnose')
            .setDescription('Diagnose a role.')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to diagnose.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        
    }
}