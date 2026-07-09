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
            .setName('addall')
            .setDescription('Add all roles to a user.')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to add all roles to.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);

        const embed = new EmbedBuilder()
            .setTitle(':warning: Confirm Role Assignment')
            .setDescription(`Are you sure you want to add all roles to <@${member.user.id}>? This action cannot be undone.`)
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
                    .setDescription('The action to add all roles to the user has been cancelled.')
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
                    .setDescription(`The action to add all roles to <@${member.user.id}> has been confirmed. The roles will be added shortly.`)
                    .setColor(process.env.COLOR_ORANGE)
                    .setFooter({ text: process.env.EMBED_FOOTER })
                    .setTimestamp();

                await i.update({
                    embeds: [confirmEmbed],
                    components: [],
                });

                collector.stop('confirmed');

                try {
                    await roleQueue.add(async () => {
                        const rolesToAdd = interaction.guild.roles.cache.filter(role =>
                            role.id !== interaction.guild.id &&
                            !role.managed &&
                            !member.roles.cache.has(role.id) &&
                            role.editable
                        );

                        if (rolesToAdd.size > 0) {
                            await member.roles.add([...rolesToAdd.values()]);
                        }

                        const successEmbed = new EmbedBuilder()
                            .setTitle('Roles Added')
                            .setDescription(`**${rolesToAdd.size}** roles have been added to <@${member.user.id}>.`)
                            .setColor(process.env.COLOR_GREEN)
                            .setFooter({ text: process.env.EMBED_FOOTER })
                            .setTimestamp();

                        await interaction.editReply({ 
                            embeds: [successEmbed] 
                        });
                    })
                } catch (err) {
                    consoleLog('error', `Failed to add all roles to ${member.user.tag} (${member.user.id}): ${err.stack || err}`);
                    writeLogToFile(`Failed to add all roles to ${member.user.tag} (${member.user.id}): ${err.stack || err}`);

                    const failedEmbed = new EmbedBuilder()
                        .setTitle('Action Failed')
                        .setDescription(`Failed to add all roles to <@${member.user.id}>. Please check the logs for more information.`)
                        .setColor(process.env.COLOR_RED)
                        .setFooter({ text: process.env.EMBED_FOOTER })
                        .setTimestamp();

                    await interaction.editReply({
                        embeds: [failedEmbed],
                        components: [],
                    });
                }
            }
        })

        collector.on('end', async (collected, reason) => {
            if (reason === 'confirmed' || reason === 'cancelled') return;

            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle('Action Timed Out')
                    .setDescription('The action to add all roles to the user has timed out. Please try again.')
                    .setColor(process.env.COLOR_RED)
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