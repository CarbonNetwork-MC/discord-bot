const { 
    EmbedBuilder, 
    MessageFlags,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
} = require("discord.js");

const { consoleLog, writeLogToFile } = require('../../../../services/logger.js');

module.exports = {
    data: subcommand =>
        subcommand
            .setName('list')
            .setDescription('Lists all roles in the server.'),

    async execute(interaction) {
        const roles = interaction.guild.roles.cache
            .sort((a, b) => b.position - a.position)
            .map(role => `${role} - (${role.id})`);

        const maxRolesPerPage = 20;
        const totalPages = Math.ceil(roles.length / maxRolesPerPage);
        let page = 0;

        const generateEmbed = (page) => {
            const start = page * maxRolesPerPage;
            const currentRoles = roles.slice(start, start + maxRolesPerPage).join('\n');

            return new EmbedBuilder()
                .setTitle(`Roles in ${interaction.guild.name}`)
                .setDescription(currentRoles || 'No roles found.')
                .setColor(process.env.COLOR_BLUE)
                .setFooter({ text: `Page ${page + 1}/${totalPages} • ${process.env.EMBED_FOOTER}` })
                .setTimestamp();
        }

        const generateButtons = (page) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === totalPages - 1)
            );
        };

        try {
            const reply = await interaction.reply({
                embeds: [generateEmbed(page)],
                components: totalPages > 1 ? [generateButtons(page)] : [],
                withResponse: true,
            });
            const response = await interaction.fetchReply();

            if (totalPages <= 1) return;

            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60_000,
            });

            collector.on('collect', async (btn) => {
                if (btn.user.id !== interaction.user.id) {
                    return btn.reply({
                        content: 'Only the command user can use these buttons.',
                        flags: MessageFlags.Ephemeral,
                    });
                }

                if (btn.customId === 'prev') {
                    page--;
                }

                if (btn.customId === 'next') {
                    page++;
                }

                await btn.update({
                    embeds: [generateEmbed(page)],
                    components: [generateButtons(page)],
                });
            });

            collector.on('end', async () => {
                await response.edit({
                    components: [],
                }).catch(() => {});
            });

        } catch (err) {
            consoleLog('error', `Error in role list command: ${err}`);
            writeLogToFile('error', `Error in role list command: ${err}`);
        }
    }
}