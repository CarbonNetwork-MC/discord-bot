const { 
    SlashCommandBuilder, 
    EmbedBuilder,
    InteractionContextType,
    ApplicationIntegrationType
} = require('discord.js');
const math = require('mathjs');

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

    data: new SlashCommandBuilder()
        .setName('math')
        .setDescription('Calculate things.')
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		])
        .addStringOption(option =>
            option.setName('expression')
                .setDescription('The mathematical expression to calculate.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const expression = interaction.options.getString('expression');
        try {
            const result = math.evaluate(expression);

            const embed = new EmbedBuilder()
                .setTitle('Math Result')
                .addFields(
                    { name: 'Input', value: `\`${expression}\`` },
                    { name: 'Output', value: `\`${result.toString()}\`` }
                )
                .setColor(process.env.COLOR_BLUE)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply(`Error: ${error.message}`);
        }
    }
};