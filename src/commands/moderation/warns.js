const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags } = require('discord.js');

const { getWarns } = require('../../utils/punishmentApplier');

module.exports = {
    isDev: true,
    servers: null,
    allowedUsers: null,
    requiredPermissions: [
        'ModerateMembers',
    ],
    data: new SlashCommandBuilder()
        .setName('warns')
        .setDescription('View all warns for a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to view warns for')
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user');

        try {
            const rows = await getWarns(interaction);
            const embed = new EmbedBuilder()
                .setTitle(`Warns for ${user.username}`)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            const row = new ActionRowBuilder();

            if (rows.length === 0) {
                embed.setDescription('No warns found for this user.');
                embed.setColor(process.env.COLOR_GREEN);
                return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

            embed.setColor('#FFA500');

            // Add buttons for each warn
            rows.forEach(warn => {
                embed.addFields({ name: `${numberIcons[rows.indexOf(warn) + 1]} ID: ${warn.id}`, value: warn.reason });
                row.addComponents(
                    new ButtonBuilder().setCustomId(`warn_${warn.id}`).setEmoji(numberIcons[rows.indexOf(warn) + 1]).setStyle(ButtonStyle.Secondary)
                )
            });

            // Add a close button
            row.addComponents(
                new ButtonBuilder().setCustomId('close').setLabel('Close').setStyle(ButtonStyle.Danger)
            );

            // Send the embed with buttons
            const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
            const collector = message.createMessageComponentCollector({ time: 60000 });

            // Handle button interactions
            collector.on('collect', async (btn) => {
                if (btn.user.id !== interaction.user.id) return btn.reply({ content: 'You cannot use this button.', flags: MessageFlags.Ephemeral });

                if (btn.customId === 'close') {
                    await btn.message.delete();
                    return collector.stop();
                }

                const warnId = btn.customId.split('_')[1];
                const warn = rows.find(w => w.id === parseInt(warnId));
                if (!warn) {
                    return btn.reply({ content: 'Warn not found.', flags: MessageFlags.Ephemeral });
                }

                const warnEmbed = new EmbedBuilder()
                    .setTitle(`Warn Details for ID: ${warn.id}`)
                    .setDescription(`**Reason:** ${warn.reason}\n**Moderator:** <@${warn.moderator_id}>`)
                    .setColor(process.env.COLOR_YELLOW)
                    .setFooter({ text: process.env.EMBED_FOOTER })
                    .setTimestamp();

                await btn.update({ embeds: [warnEmbed], components: [] });
            })
        } catch (error) {
            console.error('Error fetching warns:', error);
            await interaction.reply({ content: 'An error occurred while fetching warns.', flags: MessageFlags.Ephemeral });
        }
    },
};

const numberIcons = {
    0: '0️⃣',
    1: '1️⃣',
    2: '2️⃣',
    3: '3️⃣',
    4: '4️⃣',
    5: '5️⃣',
    6: '6️⃣',
    7: '7️⃣',
    8: '8️⃣',
    9: '9️⃣'
}