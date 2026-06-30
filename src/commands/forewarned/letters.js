const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    isDev: false,
    servers: null,
    data: new SlashCommandBuilder()
        .setName('letters')
        .setDescription('Get the letter combinations for Forewarned'),

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