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
		.setName('unnick')
		.setDescription('Remove the nickname of a user in the server.')
		.setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
		])
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose nickname you want to remove')
                .setRequired(true)
        ),
		
	async execute(interaction) {
		const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);

        if (!member) {
            return interaction.reply({ 
                content: 'User not found in this server.',
                flags: MessageFlags.Ephemeral
            });
        }

        try {
            await member.setNickname(null);

            const embed = new EmbedBuilder()
                .setTitle('Nickname Removed')
                .setDescription(`Successfully removed ${user.username}'s nickname.`)
                .setColor(process.env.COLOR_BLUE)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            return interaction.reply({ 
                embeds: [embed],
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            consoleLog('error', `Error while trying to remove nickname for user ${user.username} (${user.id}): ${error}`);
            writeLogToFile('error', `Error while trying to remove nickname for user ${user.username} (${user.id}): ${error}`);
            return interaction.reply({ 
                content: 'There was an error while trying to remove the nickname.',
                flags: MessageFlags.Ephemeral
            });
        }
	},
};
