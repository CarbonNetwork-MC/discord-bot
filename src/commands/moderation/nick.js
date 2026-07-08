const { 
    SlashCommandBuilder,
    EmbedBuilder,
    MessageFlags,
    InteractionContextType,
    ApplicationIntegrationType 
} = require('discord.js');

const { consoleLog, writeLogToFile } = require('../../services/logger.js');

module.exports = {
	isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: [
        'ManageNicknames',
    ],

	data: new SlashCommandBuilder()
		.setName('nick')
		.setDescription('Change the nickname of a user in the server.')
		.setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
		])
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose nickname you want to change')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('The new nickname for the user')
                .setRequired(true)
        ),
		
	async execute(interaction) {
		const user = interaction.options.getUser('user');
        const nickname = interaction.options.getString('nickname');

        const member = await interaction.guild.members.fetch(user.id);

        if (!member) {
            return interaction.reply({ 
                content: 'User not found in this server.',
                flags: MessageFlags.Ephemeral
            });
        }

        try {
            await member.setNickname(nickname);

            const embed = new EmbedBuilder()
                .setTitle('Nickname Changed')
                .setDescription(`Successfully changed ${user.username}'s nickname to ${nickname}.`)
                .setColor(process.env.COLOR_BLUE)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            return interaction.reply({ 
                embeds: [embed],
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            consoleLog('error', `Error while trying to change nickname for user ${user.username} (${user.id}): ${error}`);
            writeLogToFile('error', `Error while trying to change nickname for user ${user.username} (${user.id}): ${error}`);
            return interaction.reply({ 
                content: 'Failed to change nickname. Make sure I have the necessary permissions.',
                flags: MessageFlags.Ephemeral
            });
        }
	},
};
