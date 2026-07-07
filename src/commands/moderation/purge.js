const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    MessageFlags,
    ApplicationIntegrationType,
    InteractionContextType
} = require('discord.js');

module.exports = {
	isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Deletes messages from a channel.')
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
		])
        .addSubcommand(subcommand =>
            subcommand
                .setName('number')
                .setDescription('Deletes a specific number of messages from a channel.')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('The number of messages to delete (1-100).')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('bot')
                .setDescription('Deletes messages from a channel that were sent by a bot.')
                .addUserOption(option =>
                    option.setName('bot')
                        .setDescription('The bot whose messages to delete.')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('The number of messages to delete (1-100).')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('human')
                .setDescription('Deletes messages from a channel that were sent by a human.')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('The number of messages to delete (1-100).')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Deletes messages from a channel that were sent by a specific user.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user whose messages to delete.')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('The number of messages to delete (1-100).')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('contains')
                .setDescription('Deletes messages from a channel that contain a specific string.')
                .addStringOption(option =>
                    option.setName('string')
                        .setDescription('The string to search for in messages.')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('The number of messages to delete (1-100).')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('embeds')
                .setDescription('Deletes messages from a channel that contain embeds.')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('The number of messages to delete (1-100).')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('attachments')
                .setDescription('Deletes messages from a channel that contain attachments.')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('The number of messages to delete (1-100).')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('links')
                .setDescription('Deletes messages from a channel that contain links.')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('The number of messages to delete (1-100).')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('reactions')
                .setDescription('Deletes messages from a channel that contain reactions.')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('The number of messages to delete (1-100).')
                        .setRequired(false)
                )
        ),

	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
        const amount = interaction.options.getInteger('amount') || 100;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const embed = new EmbedBuilder()
            .setTitle(`:wastebasket: Message Purge`)
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        async function purgeFiltered(filterFn) {
            const fetched = await interaction.channel.messages.fetch({ limit: 100 });

            const filtered = fetched
                .filter(filterFn)
                .first(amount);

            if (!filtered.length) {
                embed.setDescription('No matching messages found to delete.');
                return interaction.editReply({ embeds: [embed] });
            }

            const deleted = await interaction.channel.bulkDelete(filtered, true);

            embed.setDescription(`Successfully deleted ${deleted.size} matching message(s) from this channel.`);
            return interaction.editReply({ embeds: [embed] });
        }

        if (subcommand === 'number') {
            const messages = await interaction.channel.messages.fetch({ limit: amount });
            const deleted = await interaction.channel.bulkDelete(messages, true);

            embed.setDescription(`Successfully deleted ${deleted.size} message(s) from this channel.`);
            return interaction.editReply({ embeds: [embed] });
        }

        if (subcommand === 'bot') {
            const bot = interaction.options.getUser('bot');

            return purgeFiltered(message =>
                message.author.bot &&
                message.author.id === bot.id
            );
        }

        if (subcommand === 'human') {
            return purgeFiltered(message => !message.author.bot);
        }

        if (subcommand === 'user') {
            const user = interaction.options.getUser('user');

            return purgeFiltered(message => message.author.id === user.id);
        }

        if (subcommand === 'contains') {
            const string = interaction.options.getString('string').toLowerCase();

            return purgeFiltered(message =>
                message.content.toLowerCase().includes(string)
            );
        }

        if (subcommand === 'embeds') {
            return purgeFiltered(message => message.embeds.length > 0);
        }

        if (subcommand === 'attachments') {
            return purgeFiltered(message => message.attachments.size > 0);
        }

        if (subcommand === 'links') {
            const linkRegex = /(https?:\/\/[^\s]+)/i;

            return purgeFiltered(message => linkRegex.test(message.content));
        }

        if (subcommand === 'reactions') {
            return purgeFiltered(message => message.reactions.cache.size > 0);
        }
	},
};
