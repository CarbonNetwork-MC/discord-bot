const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: [
        'KickMembers'
    ],
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user from the server')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to kick')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for the kick')
                .setRequired(false)
        ),
    async execute(interaction) {
        await interaction.reply('Test kick command executed!');
    }
}