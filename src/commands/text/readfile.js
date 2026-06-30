const fs = require('fs/promises');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
	isDev: false,
    servers: null,
    allowedUsers: [
		'114364015307653126',
	],
    requiredPermissions: null,
	data: new SlashCommandBuilder()
		.setName('readfile')
		.setDescription('Reads a text file and sends it as an embed.')
		.addStringOption(option =>
			option.setName('path')
				.setDescription('Relative path to the text file')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('title')
				.setDescription('Optional title for the embed')
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName('reply-type')
				.setDescription('How the bot should reply')
				.addChoices(
					{ name: 'Public', value: 'public' },
					{ name: 'Message', value: 'message' },
					{ name: 'Private', value: 'ephemeral' }
				)
				.setRequired(false)
		),

	async execute(interaction) {
		const inputPath = interaction.options.getString('path');
		const title = interaction.options.getString('title');

		const filePath = path.join(__dirname, '../../storage/', inputPath);

		try {
			const fileContent = await fs.readFile(filePath, 'utf8');
			const embed = new EmbedBuilder()
				.setTitle(title || '📄 File Content')
				.setDescription(fileContent.length > 4096 ? fileContent.slice(0, 4093) + '...' : fileContent)
				.setColor('#3896fc')
                .setFooter({ text: process.env.EMBED_FOOTER || '' })
                .setTimestamp();

			const replyType = interaction.options.getString('reply-type') || 'public';
			if (replyType !== 'message') {
				const replyOptions = { embeds: [embed] };
				if (replyType === 'ephemeral') {
					replyOptions.flags = MessageFlags.Ephemeral;
				}

				await interaction.reply(replyOptions);
			} else {
				await interaction.channel.send({ embeds: [embed] });
				await interaction.reply({ content: '✅ File content sent to the channel.', flags: MessageFlags.Ephemeral });
			}
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: `❌ Failed to read file at \`${inputPath}\`. Make sure the path is correct.`,
				flags: MessageFlags.Ephemeral,
			});
		}
	}

};
