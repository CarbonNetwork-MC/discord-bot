const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: subcommand =>
        subcommand
            .setName('removebots')
            .setDescription('Remove a role from all bots.')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to remove from all bots.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        
    }
}