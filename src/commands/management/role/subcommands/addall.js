const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: subcommand =>
        subcommand
            .setName('addall')
            .setDescription('Add all roles to a user.')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to add all roles to.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        
    }
}