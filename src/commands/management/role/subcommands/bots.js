const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: subcommand =>
        subcommand
            .setName('bots')
            .setDescription('Add a role to all bots.')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to add to all bots.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        
    }
}