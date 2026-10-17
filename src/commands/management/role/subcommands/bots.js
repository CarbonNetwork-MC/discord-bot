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
            .setName('bots')
            .setDescription('Add a role to all bots.')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to add to all bots.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const members = interaction.guild.members.cache.filter(member => member.user.bot);

        const embed = new EmbedBuilder()
            .setTitle(':warning: Confirm Role Assignment')
            .setDescription(`Are you sure you want to add the role <@&${role.id}> to all bots? This action cannot be undone.`)
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
                    .setDescription('The action to add the role to all bots has been cancelled.')
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
                    .setTitle('Action Confirmed')
                    .setDescription(`The role <@&${role.id}> is being added to all bots. This may take a while.`)
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
                                consoleLog(`Failed to add role ${role.name} to bot ${member.user.tag}: ${err}`, 'error');
                                writeLogToFile(`Failed to add role ${role.name} to bot ${member.user.tag}: ${err}`);
                            }
                        }

                        const resultEmbed = new EmbedBuilder()
                            .setTitle('Role Assignment Complete')
                            .setDescription(`The action to add the role <@&${role.id}> to all bots has been completed.`)
                            .addFields(
                                { name: 'Total Bots', value: `${members.size}`, inline: true },
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
                    });
                } catch (err) {
                    consoleLog(`Failed to add role ${role.name} to all bots: ${err}`, 'error');
                    writeLogToFile(`Failed to add role ${role.name} to all bots: ${err}`);

                    const errorEmbed = new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(`An error occurred while adding the role <@&${role.id}> to all bots. Please check the logs for more details.`)
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
                    .setDescription('The action to add the role to all bots has timed out. Please try again.')
                    .setColor(process.env.COLOR_DARK_RED)
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