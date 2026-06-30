const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: [
        'ManageMessages'
    ],
	data: new SlashCommandBuilder()
		.setName('prune')
		.setDescription('Prune a number of messages')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	async execute(interaction) {
		const amount = interaction.options.getInteger('amount');

        if (amount < 1 || amount > 100) return interaction.reply({ content: 'You must specifiy a number between 1 and 100.', flags: MessageFlags.Ephemeral });

        const channel = interaction.channel;

        try {
            const messages = await channel.bulkDelete(amount, true);
            await interaction.reply({ content: `Deleted ${messages.size} messages.`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occured while trying to delete messages.', flags: MessageFlags.Ephemeral });
        }
	},
};