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
            .setName('humans')
            .setDescription('Add a role to all humans.')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to add to all humans.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const members = interaction.guild.members.cache.filter(member => !member.user.bot);
    
        const embed = new EmbedBuilder()
            .setTitle(':warning: Confirm Role Assignment')
            .setDescription(`Are you sure you want to add the role <@&${role.id}> to all humans? This action cannot be undone.`)
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
                    .setDescription('The action to add the role to all humans has been cancelled.')
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
                    .setTitle('Role Assignment in Progress')
                    .setDescription(`The role <@&${role.id}> is being added to all humans. This may take some time depending on the number of members.`)
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
                                if (member.roles.cache.has(role.id)) {
                                    skipped++;
                                    continue;
                                }

                                await member.roles.add(role);
                                success++;
                            } catch (err) {
                                failed++;
                                consoleLog(`Failed to add role to member ${member.user.tag} (${member.id}): ${err.message}`, 'error');
                                writeLogToFile(`Failed to add role to member ${member.user.tag} (${member.id}): ${err.message}`);
                            }
                        }

                        const resultEmbed = new EmbedBuilder()
                            .setTitle('Role Assignment Completed')
                            .setDescription(`The role <@&${role.id}> has been added to all humans.`)
                            .addFields(
                                { name: 'Total Members Processed', value: `${members.size}`, inline: true },
                                { name: 'Successfully Added', value: `${success}`, inline: true },
                                { name: '\u200b', value: '\u200b', inline: true },
                                { name: 'Failed to Add', value: `${failed}`, inline: true },
                                { name: 'Skipped (Already Had Role)', value: `${skipped}`, inline: true }
                            )
                            .setColor(process.env.COLOR_GREEN)
                            .setFooter({ text: process.env.EMBED_FOOTER })
                            .setTimestamp();

                        await interaction.editReply({
                            embeds: [resultEmbed],
                            ephemeral: true,
                        });
                    });
                } catch (err) {
                    consoleLog(`Error processing role assignment: ${err.message}`, 'error');
                    writeLogToFile(`Error processing role assignment: ${err.message}`);

                    const errorEmbed = new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(`An error occurred while adding the role <@&${role.id}> to all humans. Please check the logs for more details.`)
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
                    .setDescription('The action to add the role to all humans has timed out. Please try again.')
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