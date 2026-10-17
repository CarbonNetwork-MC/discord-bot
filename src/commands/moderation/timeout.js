const { 
    SlashCommandBuilder,
    EmbedBuilder,
    MessageFlags,
    InteractionContextType,
    ApplicationIntegrationType 
} = require('discord.js');

const { formatTime } = require('../../utils/timeFormatter.js');

module.exports = {
	isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

	data: new SlashCommandBuilder()
		.setName('timeout')
		.setDescription('Timeout a user in the server.')
		.setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
		])
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a timeout to a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to timeout')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('duration')
                        .setDescription('Duration of the timeout in minutes')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a timeout from a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to remove the timeout from')
                        .setRequired(true)
                )
        ),
		
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const user = interaction.options.getUser('user');
            let duration = interaction.options.getInteger('duration');

            const member = await interaction.guild.members.fetch(user.id).catch(err => {
                consoleLog('error', `Failed to fetch member ${user.id} in guild ${interaction.guild.id}: ${err}`);
                writeLogToFile(`Failed to fetch member ${user.id} in guild ${interaction.guild.id}: ${err}`);
                return null;
            });

            if (!member) {
                return interaction.reply({ 
                    content: `Failed to fetch member <@${user.id}>.`, 
                    flags: MessageFlags.Ephemeral
                });
            }

            duration = Number(duration);
            if (!Number.isFinite(duration) || duration <= 0) {
                return interaction.reply({ 
                    content: 'Invalid timeout duration.', 
                    flags: MessageFlags.Ephemeral
                });
            }

            const maxTimeoutMinutes = 28 * 24 * 60;
            if (duration > maxTimeoutMinutes) {
                return interaction.reply({ 
                    content: 'Timeout duration exceeds the maximum limit of 28 days.', 
                    flags: MessageFlags.Ephemeral
                });
            }

            try {
                await member.timeout(duration * 60 * 1000, 'No reason provided');
            } catch (err) {
                consoleLog('error', `Failed to timeout member ${user.id} in guild ${interaction.guild.id}: ${err}`);
                writeLogToFile(`Failed to timeout member ${user.id} in guild ${interaction.guild.id}: ${err}`);
                return interaction.reply({
                    content: `Failed to timeout member <@${user.id}>.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('User Timed Out')
                .setDescription(`User <@${user.id}> has been timed out for ${formatTime(duration * 60)}.`)
                .addFields(
                    { name: 'Reason', value: 'No reason provided' },
                    { name: 'Moderator', value: `${interaction.user.tag} (<@${interaction.user.id}>)` }
                )
                .setColor(process.env.COLOR_ORANGE)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            return interaction.reply({ 
                embeds: [embed]
            });
        } else if (subcommand === 'remove') {
            const user = interaction.options.getUser('user');
            const member = await interaction.guild.members.fetch(user.id).catch(err => {
                consoleLog('error', `Failed to fetch member ${user.id} in guild ${interaction.guild.id}: ${err}`);
                writeLogToFile(`Failed to fetch member ${user.id} in guild ${interaction.guild.id}: ${err}`);
                return null;
            });

            if (!member) {
                return interaction.reply({ 
                    content: `Failed to fetch member <@${user.id}>.`, 
                    flags: MessageFlags.Ephemeral
                });
            }

            try {
                await member.timeout(null, 'Timeout removed');
            } catch (err) {
                consoleLog('error', `Failed to remove timeout from member ${user.id} in guild ${interaction.guild.id}: ${err}`);
                writeLogToFile(`Failed to remove timeout from member ${user.id} in guild ${interaction.guild.id}: ${err}`);
                return interaction.reply({
                    content: `Failed to remove timeout from member <@${user.id}>.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('Timeout Removed')
                .setDescription(`Timeout has been removed from user <@${user.id}>.`)
                .addFields(
                    { name: 'Moderator', value: `${interaction.user.tag} (<@${interaction.user.id}>)` }
                )
                .setColor(process.env.COLOR_GREEN)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            return interaction.reply({ 
                embeds: [embed]
            });
        }
	},
};