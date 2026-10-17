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
            .setName('removeall')
            .setDescription('Remove all roles from a member.')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The member to remove all roles from.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);

        const embed = new EmbedBuilder()
            .setTitle(':warning: Confirm Role Removal')
            .setDescription(`Are you sure you want to remove all roles from <@${member.user.id}>? This action cannot be undone.`)
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
                    .setDescription('The action to remove all roles from the user has been cancelled.')
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
                    .setDescription(`The action to remove all roles from <@${member.user.id}> has been confirmed. The roles will be removed shortly.`)
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
                        const rolesToRemove = member.roles.cache.filter(role =>
                            role.id !== interaction.guild.id &&
                            !role.managed &&
                            role.editable
                        );

                        if (rolesToRemove.size > 0) {
                            await member.roles.remove([...rolesToRemove.values()]);
                        }

                        const successEmbed = new EmbedBuilder()
                            .setTitle('Roles Removed')
                            .setDescription(`**${rolesToRemove.size}** roles have been removed from <@${member.user.id}>.`)
                            .setColor(process.env.COLOR_GREEN)
                            .setFooter({ text: process.env.EMBED_FOOTER })
                            .setTimestamp();

                        await interaction.editReply({ 
                            embeds: [successEmbed] 
                        });
                    })
                } catch (err) {
                    consoleLog('error', `Failed to remove all roles from ${member.user.tag} (${member.user.id}): ${err.stack || err}`);
                    writeLogToFile(`Failed to remove all roles from ${member.user.tag} (${member.user.id}): ${err.stack || err}`);

                    const failedEmbed = new EmbedBuilder()
                        .setTitle('Action Failed')
                        .setDescription(`Failed to remove all roles from <@${member.user.id}>. Please check the logs for more information.`)
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
                    .setDescription('The action to remove all roles from the user has timed out. Please try again.')
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