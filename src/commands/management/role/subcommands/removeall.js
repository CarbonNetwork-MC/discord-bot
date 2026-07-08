const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: subcommand =>
        subcommand
            .setName('removeall')
            .setDescription('Remove all roles from a member.')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The member to remove all roles from.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        
    }
}