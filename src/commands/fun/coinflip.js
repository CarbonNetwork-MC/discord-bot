const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    MessageFlags, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    InteractionContextType,
    ApplicationIntegrationType
} = require('discord.js');

const coinSides = ['Heads', 'Tails'];

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flips a coin!')
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		]),

    async execute(interaction) {
        const result = await handleCoinFlip();

        const embed = new EmbedBuilder()
            .setDescription(`The coin landed on **${result}**!`)
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        const flipAgainButton = new ButtonBuilder()
            .setCustomId('flip_again')
            .setLabel('Flip Again')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(flipAgainButton);

        const response = await interaction.reply({ 
            embeds: [embed], 
            components: [row],
            withResponse: true
        });
        const message = await interaction.fetchReply();

        const collector = message.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (btn) => {
            if (btn.customId === 'flip_again') {
                if (btn.user.id !== interaction.user.id) {
                    await btn.reply({ 
                        content: "You can't flip the coin for someone else!", 
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }

                const newResult = await handleCoinFlip();
                const newEmbed = new EmbedBuilder()
                    .setDescription(`The coin landed on **${newResult}**!`)
                    .setColor(process.env.COLOR_BLUE)
                    .setFooter({ text: process.env.EMBED_FOOTER })
                    .setTimestamp();

                await btn.update({ embeds: [newEmbed], components: [row] });
            }
        });

        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                await message.edit({
                    components: []
                });
            }
        })
    }
}

async function handleCoinFlip() {
    const result = coinSides[Math.floor(Math.random() * coinSides.length)];
    return result;
}
