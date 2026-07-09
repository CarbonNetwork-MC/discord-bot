const { 
    EmbedBuilder,
    MessageFlags,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

const { roleQueue } = require('../../../../bootstrap/setup-queues.js');
const { consoleLog, writeLogToFile } = require('../../../../services/logger.js');

module.exports = {
    data: subcommand =>
        subcommand
            .setName('removehumans')
            .setDescription('Remove a role from all humans.')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to remove from all humans.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const members = interaction.guild.members.cache.filter(member => !member.user.bot);

        const embed = new EmbedBuilder()
            .setTitle(':warning: Confirm Role Removal')
            .setDescription(`Are you sure you want to remove the role <@&${role.id}> from all humans? This action cannot be undone.`)
            .setColor(process.env.COLOR_DARK_RED)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Confirm')
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary)
        );

        const reply = await interaction.reply({
            embeds: [embed],
            components: [row],
            withResponse: true,
        });
        let response = await interaction.fetchReply();

        const filter = i => i.user.id === interaction.user.id;
        const collector = response.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'cancel') {
                const cancelEmbed = new EmbedBuilder()
                    .setTitle('Action Cancelled')
                    .setDescription('The action to remove the role from all humans has been cancelled.')
                    .setColor(process.env.COLOR_DARK_RED)
                    .setFooter({ text: process.env.EMBED_FOOTER })
                    .setTimestamp();

                collector.stop('cancelled');

                await i.update({
                    embeds: [cancelEmbed],
                    components: [],
                });
            } else if (i.customId === 'confirm') {
                const confirmEmbed = new EmbedBuilder()
                    .setTitle('Role Removal in Progress')
                    .setDescription(`Removing the role <@&${role.id}> from all humans. This may take a while depending on the number of members.`)
                    .setColor(process.env.COLOR_ORANGE)
                    .setFooter({ text: process.env.EMBED_FOOTER })
                    .setTimestamp();

                collector.stop('confirmed');

                await i.update({
                    embeds: [confirmEmbed],
                    components: [],
                });

                try {
                    await roleQueue.add(async () => {
                        let success = 0;
                        let failed = 0;
                        let skipped = 0;

                        for (const member of members.values()) {
                            try {
                                if (!member.roles.cache.has(role.id)) {
                                    skipped++;
                                    continue;
                                }

                                await member.roles.remove(role.id);
                                success++;
                            } catch (err) {
                                failed++;
                                consoleLog('error', `Failed to remove role from human ${member.user.tag} (${member.id}): ${err}`);
                                writeLogToFile('error', `Failed to remove role from human ${member.user.tag} (${member.id}): ${err}`);
                            }
                        }

                        const resultEmbed = new EmbedBuilder()
                            .setTitle('Role Removal Complete')
                            .setDescription(`Role <@&${role.id}> has been removed from all humans.`)
                            .addFields(
                                { name: 'Total Members Processed', value: `${members.size}`, inline: true },
                                { name: 'Successfully Removed', value: `${success}`, inline: true },
                                { name: '\u200b', value: '\u200b', inline: true },
                                { name: 'Failed to Remove', value: `${failed}`, inline: true },
                                { name: 'Skipped (Role Not Present)', value: `${skipped}`, inline: true },
                            )
                            .setColor(process.env.COLOR_GREEN)
                            .setFooter({ text: process.env.EMBED_FOOTER })
                            .setTimestamp();

                        await interaction.editReply({
                            embeds: [resultEmbed],
                        });
                    })
                } catch (err) {
                    consoleLog('error', `Error during role removal from humans: ${err}`);
                    writeLogToFile('error', `Error during role removal from humans: ${err}`);

                    const errorEmbed = new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(`An error occurred while removing the role <@&${role.id}> from all humans.`)
                        .setColor(process.env.COLOR_DARK_RED)
                        .setFooter({ text: process.env.EMBED_FOOTER })
                        .setTimestamp();

                    await interaction.editReply({
                        embeds: [errorEmbed],
                    });
                }
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'confirmed' || reason === 'cancelled') return;

            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle('Action Timed Out')
                    .setDescription('No response was received in time. The action to remove the role from all humans has been cancelled.')
                    .setColor(process.env.COLOR_DARK_RED)
                    .setFooter({ text: process.env.EMBED_FOOTER })
                    .setTimestamp();

                await interaction.editReply({
                    embeds: [timeoutEmbed],
                    components: [],
                });
            }
        })
    }
}