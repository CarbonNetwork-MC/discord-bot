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
            .setName('removein')
            .setDescription('Remove a role from all members currently in a role.')
            .addRoleOption(option =>
                option.setName('base_role')
                    .setDescription('The role to check for members currently in.')
                    .setRequired(true)
            )
            .addRoleOption(option =>
                option.setName('remove_role')
                    .setDescription('The role to remove from all members currently in the base role.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        const baseRole = interaction.options.getRole('base_role');
        const removeRole = interaction.options.getRole('remove_role');

        const embed = new EmbedBuilder()
            .setTitle(':warning: Confirm Role Removal')
            .setDescription(`Are you sure you want to remove ${removeRole} from all members currently in ${baseRole}? This action cannot be undone.`)
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
                    .setDescription('The action to remove the role from all members currently in the base role has been cancelled.')
                    .setColor(process.env.COLOR_RED)
                    .setFooter({ text: process.env.EMBED_FOOTER })
                    .setTimestamp();

                collector.stop('cancelled');

                await i.update({
                    embeds: [cancelEmbed],
                    components: [],
                })
                return;
            } else if (i.customId === 'confirm') {
                const confirmEmbed = new EmbedBuilder()
                    .setTitle('Action Confirmed')
                    .setDescription(`The action to remove ${removeRole} from all members currently in ${baseRole} has been confirmed.`)
                    .setColor(process.env.COLOR_GREEN)
                    .setFooter({ text: process.env.EMBED_FOOTER })
                    .setTimestamp();

                await i.update({
                    embeds: [confirmEmbed],
                    components: [],
                });

                collector.stop('confirmed');
                
                try {
                    await roleQueue.add(async () => {
                        const members = await interaction.guild.members.fetch();

                        let success = 0;
                        let failed = 0;
                        let skipped = 0;

                        for (const member of members.values()) {
                            try {
                                if (!member.roles.cache.has(baseRole.id)) continue;
                                
                                if (!member.roles.cache.has(removeRole.id)) {
                                    skipped++;
                                    continue;
                                }

                                await member.roles.remove(removeRole);
                                success++;
                            } catch (err) {
                                failed++;
                                consoleLog('error', `Error removing role from member ${member.user.tag}: ${err}`);
                                writeLogToFile('error', `Error removing role from member ${member.user.tag}: ${err}`);
                            }
                        }

                        const resultEmbed = new EmbedBuilder()
                            .setTitle('Role Removal Complete')
                            .setDescription(`Removed ${removeRole} from members in ${baseRole}.`)
                            .addFields(
                                { name: 'Total Members Processed', value: `${members.size}`, inline: true },
                                { name: 'Successfully Removed', value: `${success}`, inline: true },
                                { name: '\u200B', value: '\u200B', inline: true },
                                { name: 'Failed to Remove', value: `${failed}`, inline: true },
                                { name: 'Skipped (Did not have Role)', value: `${skipped}`, inline: true },
                            )
                            .setColor(process.env.COLOR_GREEN)
                            .setFooter({ text: process.env.EMBED_FOOTER })
                            .setTimestamp();

                        await interaction.editReply({
                            embeds: [resultEmbed],
                        });
                    })
                } catch (err) {
                    consoleLog('error', `Error removing role from members in role: ${err}`);
                    writeLogToFile('error', `Error removing role from members in role: ${err}`);

                    const errorEmbed = new EmbedBuilder()
                        .setTitle('Error Removing Role')
                        .setDescription(`An error occurred while removing ${removeRole} from members in ${baseRole}. Please try again later.`)
                        .setColor(process.env.COLOR_RED)
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
                    .setDescription('The action to add the role to all members has timed out.')
                    .setColor(process.env.COLOR_RED)
                    .setFooter({ text: process.env.EMBED_FOOTER })
                    .setTimestamp();

                await interaction.editReply({
                    embeds: [timeoutEmbed],
                    components: [],
                });
            }
        });
    }
}