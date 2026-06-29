const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { getDbPool } = require('../../services/database');
const punishmentApplier = require('../../utils/punishmentApplier');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user')  
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the warning')
                .setRequired(true)
        ),
    async execute(interaction) {
        /* 
         * 1. Warn + mute
         * 2. Warn + long mute
         * 3. Warn + kick
         * 4. Warn + ban
        */

        try {
            let success= await punishmentApplier.addWarn(interaction);

            if (!success) {
                return interaction.reply({ content: 'Failed to add warn.', ephemeral: true });
            }

            const user = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason');

            const embed = new EmbedBuilder()
                .setColor(process.env.COLOR_YELLOW)
                .setTitle('User Warned')
                .setDescription(`User <@${user.id}> has been warned.`)
                .addFields(
                    { name: 'Reason', value: reason },
                    { name: 'Moderator', value: `<@${interaction.user.id}>` }
                )
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: false });
        } catch (error) {
            console.error('Error executing warn command:', error);
            await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
        }
    }
}
