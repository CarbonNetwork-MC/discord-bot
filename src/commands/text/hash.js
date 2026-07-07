const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    MessageFlags,
    InteractionContextType,
    ApplicationIntegrationType
} = require('discord.js');

module.exports = {
	isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

	data: new SlashCommandBuilder()
		.setName('hash')
		.setDescription('Replies with the hash of the input text')
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		])
        .addSubcommand(subcommand =>
            subcommand
                .setName('md5')
                .setDescription('Get the MD5 hash of the input text')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('The text to hash')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('sha1')
                .setDescription('Get the SHA-1 hash of the input text')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('The text to hash')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('sha256')
                .setDescription('Get the SHA-256 hash of the input text')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('The text to hash')
                        .setRequired(true))
        ),

	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
        const text = interaction.options.getString('text');

        let hash;
        switch (subcommand) {
            case 'md5':
                hash = require('crypto').createHash('md5').update(text).digest('hex');
                break;
            case 'sha1':
                hash = require('crypto').createHash('sha1').update(text).digest('hex');
                break;
            case 'sha256':
                hash = require('crypto').createHash('sha256').update(text).digest('hex');
                break;
        }

        const embed = new EmbedBuilder()
            .setTitle(`Hash Result`)
            .setDescription(`**Input Text:** \n\`${text}\`\n\n**Hash Type:** \`${subcommand.toUpperCase()}\`\n\n**Hash Result:** \n\`${hash}\``)
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        await interaction.reply({ 
            embeds: [embed], 
            flags: MessageFlags.Ephemeral 
        });
	},
};