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
            .setName('all')
            .setDescription('Add a role to all members.')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to add to all members.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        const role = interaction.options.getRole('role');

        const embed = new EmbedBuilder()
            .setTitle(':warning: Confirm Role Assignment')
            .setDescription(`Are you sure you want to add ${role} to all members? This action cannot be undone.`)
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
                    .setDescription('The action to add the role to all members has been cancelled.')
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
                    .setDescription(`The action to add ${role} to all members has been confirmed. The process will begin shortly.`)
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
                                if (member.user.bot) {
                                    skipped++;
                                    continue;
                                }

                                if (member.roles.cache.has(role.id)) {
                                    skipped++;
                                    continue;
                                }

                                await member.roles.add(role);
                                success++;
                            } catch (err) {
                                failed++;
                                consoleLog('error', `Failed to add role to member ${member.user.tag}: ${err}`);
                                writeLogToFile(`Failed to add role to member ${member.user.tag}: ${err}`);
                            }
                        }

                        const resultEmbed = new EmbedBuilder()
                            .setTitle('Role Assignment Complete')
                            .setDescription(`The action to add ${role} to all members has been completed.`)
                            .addFields(
                                { name: 'Total Members Processed', value: `${members.size}`, inline: true },
                                { name: 'Successfully Added', value: `${success}`, inline: true },
                                { name: '\u200b', value: '\u200b', inline: true },
                                { name: 'Failed to Add', value: `${failed}`, inline: true },
                                { name: 'Skipped (Already Had Role)', value: `${skipped}`, inline: true },
                            )
                            .setColor(process.env.COLOR_GREEN)
                            .setFooter({ text: process.env.EMBED_FOOTER })
                            .setTimestamp();

                        await interaction.editReply({
                            embeds: [resultEmbed],
                        });
                    })
                } catch (err) {
                    consoleLog('error', `Failed to add role ${role.name} to all members: ${err}`);
                    writeLogToFile(`Failed to add role ${role.name} to all members: ${err}`);

                    const errorEmbed = new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(`An error occurred while trying to add ${role} to all members.`)
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