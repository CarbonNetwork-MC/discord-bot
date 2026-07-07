const path = require('path');
const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    AttachmentBuilder,
    InteractionContextType,
    ApplicationIntegrationType
} = require('discord.js');

module.exports = {
    isDev: false,
    servers: [
        '1203116259693301830', // Carbon Network
    ],
    allowedUsers: null,
    requiredPermissions: null,

    data: new SlashCommandBuilder()
        .setName('letters')
        .setDescription('Get the letter combinations for Forewarned')
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		]),

    async execute(interaction) {
        const imagePath = path.join(__dirname, '../../src/storage/images/letters.png');

        const attachment = new AttachmentBuilder(imagePath, {
            name: 'letters.png',
        });

        const embed = new EmbedBuilder()
            .setTitle('Forewarned – Letter Combinations')
            .setImage('attachment://letters.png')
            .setColor(0x2f3136);

        await interaction.reply({
            embeds: [embed],
            files: [attachment],
        });
    },
};