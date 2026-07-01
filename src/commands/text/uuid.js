const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

    data: new SlashCommandBuilder()
        .setName('uuid')
        .setDescription('Generates a random UUID')
        .addBooleanOption(option =>
            option.setName('remove-dashes')
                .setDescription('Remove dashes from the UUID')
                .setRequired(false)
        ),

    async execute(interaction) {
        let removeDashes = interaction.options.getBoolean('remove-dashes') ?? false;
        let currentUUID = generateUUID(removeDashes);

        const embed = createUUIDEmbed(currentUUID);
        const row = createButtonRow(removeDashes);

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });

        const message = await interaction.fetchReply();
        const collector = message.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (btn) => {
            if (btn.user.id !== interaction.user.id) {
                return btn.reply({
                    content: "You can't use these buttons for someone else!",
                    ephemeral: true
                });
            }

            if (btn.customId === 'generate_again') {
                currentUUID = generateUUID(removeDashes);
            }

            if (btn.customId === 'remove_dashes') {
                currentUUID = currentUUID.replace(/-/g, '');
                removeDashes = true;
            }

            if (btn.customId === 'add_dashes') {
                currentUUID = addDashesToUUID(currentUUID);
                removeDashes = false;
            }

            await btn.update({
                embeds: [createUUIDEmbed(currentUUID)],
                components: [createButtonRow(removeDashes)]
            });
        });

        collector.on('end', async () => {
            await message.edit({ components: [] }).catch(() => {});
        });
    }
};

function generateUUID(removeDashes = false) {
    const uuid = crypto.randomUUID();
    return removeDashes ? uuid.replace(/-/g, '') : uuid;
}

function addDashesToUUID(uuid) {
    return uuid.replace(
        /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
        '$1-$2-$3-$4-$5'
    );
}

function createUUIDEmbed(uuid) {
    return new EmbedBuilder()
        .setTitle(':id: Random UUID')
        .setDescription(`Here is your random UUID:\n\`${uuid}\``)
        .setColor(process.env.COLOR_BLUE)
        .setFooter({ text: process.env.EMBED_FOOTER })
        .setTimestamp();
}

function createButtonRow(removeDashes) {
    const generateAgainButton = new ButtonBuilder()
        .setCustomId('generate_again')
        .setLabel('Generate Again')
        .setStyle(ButtonStyle.Primary);

    const dashButton = new ButtonBuilder()
        .setCustomId(removeDashes ? 'add_dashes' : 'remove_dashes')
        .setLabel(removeDashes ? 'Add Dashes' : 'Remove Dashes')
        .setStyle(ButtonStyle.Secondary);

    return new ActionRowBuilder().addComponents(generateAgainButton, dashButton);
}