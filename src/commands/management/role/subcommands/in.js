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
            .setName('in')
            .setDescription('Add a role to all members currently in a role.')
            .addRoleOption(option =>
                option.setName('base_role')
                    .setDescription('The role to check for members currently in.')
                    .setRequired(true)
            )
            .addRoleOption(option =>
                option.setName('new_role')
                    .setDescription('The role to add to all members currently in the base role.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        const baseRole = interaction.options.getRole('base_role');
        const newRole = interaction.options.getRole('new_role');

        const embed = new EmbedBuilder()
            .setTitle(':warning: Confirm Role Assignment')
            .setDescription(`Are you sure you want to add ${newRole} to all members currently in ${baseRole}? This action cannot be undone.`)
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
                    .setDescription('The action to add the role to all members currently in the base role has been cancelled.')
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
                    .setDescription(`The action to add ${newRole} to all members currently in ${baseRole} has been confirmed. The process will begin shortly.`)
                    .setColor(process.env.COLOR_ORANGE)
                    .setFooter({ text: process.env.EMBED_FOOTER })
                    .setTimestamp();

                await i.update({
                    embeds: [confirmEmbed],
                    components: [],
                })

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

                                if (member.roles.cache.has(newRole.id)) {
                                    skipped++;
                                    continue;
                                }

                                await member.roles.add(newRole);
                                success++;
                            } catch (err) {
                                failed++;
                                consoleLog('error', `Failed to add role ${newRole.name} to member ${member.user.tag} (${member.id}) in guild ${interaction.guild.name} (${interaction.guild.id}): ${err}`);
                                writeLogToFile('error', `Failed to add role ${newRole.name} to member ${member.user.tag} (${member.id}) in guild ${interaction.guild.name} (${interaction.guild.id}): ${err}`);
                            }
                        }

                        const resultEmbed = new EmbedBuilder()
                            .setTitle('Role Assignment Complete')
                            .setDescription(`Successfully added ${newRole} to ${success} members.`)
                            .addFields(
                                { name: 'Total Members Processed', value: `${members.size}`, inline: true },
                                { name: 'Successfully Added', value: `${success}`, inline: true },
                                { name: '\u200b', value: '\u200b', inline: true },
                                { name: 'Failed to Add', value: `${failed}`, inline: true },
                                { name: 'Skipped (Already had Role)', value: `${skipped}`, inline: true },
                            )
                            .setColor(process.env.COLOR_GREEN)
                            .setFooter({ text: process.env.EMBED_FOOTER })
                            .setTimestamp();

                        await interaction.editReply({
                            embeds: [resultEmbed],
                        });
                    });
                } catch (err) {
                    consoleLog('error', `Error processing role assignment for ${newRole.name} in guild ${interaction.guild.name} (${interaction.guild.id}): ${err}`);
                    writeLogToFile('error', `Error processing role assignment for ${newRole.name} in guild ${interaction.guild.name} (${interaction.guild.id}): ${err}`);

                    const errorEmbed = new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(`An error occurred while processing the role assignment for ${newRole}. Please check the logs for more details.`)
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