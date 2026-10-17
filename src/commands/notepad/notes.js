const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    MessageFlags,
    ApplicationIntegrationType,
    InteractionContextType
} = require('discord.js');

const db = require('../../services/database.js');

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

    data: new SlashCommandBuilder()
        .setName('notes')
        .setDescription('Manage your personal notes')
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		])
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Get a list of your notes')
                .addStringOption(option =>
                    option.setName('visibility')
                        .setDescription('Whether only you or everyone can see the response')
                        .addChoices(
                            { name: 'Only me', value: 'private' },
                            { name: 'Everyone', value: 'public' }
                        )
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View a specific note')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('The ID of the note to view')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('visibility')
                        .setDescription('Whether only you or everyone can see the response')
                        .addChoices(
                            { name: 'Only me', value: 'private' },
                            { name: 'Everyone', value: 'public' }
                        )
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a new note')
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('The title of the note')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('content')
                        .setDescription('The content of the note')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('visibility')
                        .setDescription('Whether only you or everyone can see the response')
                        .addChoices(
                            { name: 'Only me', value: 'private' },
                            { name: 'Everyone', value: 'public' }
                        )
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a note')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('The ID of the note to remove')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const pool = db.getDbPool();

        const visibility = interaction.options.getString('visibility') ?? 'private';
        const ephemeral = visibility === 'private';

        if (subcommand === 'list') {
            const [notes] = await pool.query('SELECT * FROM dcb_notes WHERE user_id = ?', [interaction.user.id]);
            if (notes.length === 0) {
                return interaction.reply('You have no notes.');
            }

            let page = 0;
            const perPage = 10;
            const totalPages = Math.ceil(notes.length / perPage);

            const getEmbed = (page) => {
                const start = page * perPage;
                const end = start + perPage;
                const pageNotes = notes.slice(start, end);

                const notesMap = pageNotes.map(note => `**[ ${note.id} ]:** ${note.title}`).join('\n');
                const pageDescription = notesMap 
                    ? notesMap + `\n\n📄 **${notes.length} |** To view a note, use \`/notes view <id>\``
                    : 'No notes found on this page.';

                return new EmbedBuilder()
                    .setTitle('📄 Your notes')
                    .setDescription(pageDescription)
                    .setColor(process.env.COLOR_BLUE)
                    .setFooter({ text: `${process.env.EMBED_FOOTER} • Page ${page + 1}/${totalPages}` })
                    .setTimestamp();
            }

            // Create action row with buttons
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('prev').setLabel('<').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('next').setLabel('>').setStyle(ButtonStyle.Secondary)
            );

            if (!ephemeral) {
                row.addComponents(
                    new ButtonBuilder().setCustomId('close').setLabel('X').setStyle(ButtonStyle.Danger)
                )
            }

            // Send message
            const response = await interaction.reply({
                embeds: [getEmbed(page)],
                components: [row],
                withResponse: true,
                flags: ephemeral ? MessageFlags.Ephemeral : undefined
            });

            const message = await interaction.fetchReply();

            const closeEmbed = new EmbedBuilder()
                .setDescription('Notes closed.')
                .setColor(process.env.COLOR_RED)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            const collector = message.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async (btn) => {
                if (btn.user.id !== interaction.user.id) return btn.reply({ content: 'You cannot use this button.', flags: MessageFlags.Ephemeral });

                if (btn.customId === 'prev') page = Math.max(0, page - 1);
                if (btn.customId === 'next') page = Math.min(totalPages - 1, page + 1);
                if (btn.customId === 'close') {
                    await btn.update({ embeds: [closeEmbed], components: [] });
                    return collector.stop('closed');
                }

                await btn.update({ embeds: [getEmbed(page)], components: [row] });
            })

            collector.on('end', async (_, reason) => {
                if (reason === 'closed') return;

                await interaction.editReply({
                    embeds: [closeEmbed],
                    components: []
                }).catch(() => {});
            });
        }

        if (subcommand === 'view') {
            const noteId = interaction.options.getString('id');
            const [note] = await pool.query('SELECT * FROM dcb_notes WHERE user_id = ? AND id = ?', [interaction.user.id, noteId]);
            if (note.length === 0) {
                const embed = new EmbedBuilder()
                    .setTitle(':x: Note not found')
                    .setDescription(`No note found with ID ${noteId}.`)
                    .setColor(process.env.COLOR_RED)
                    .setFooter({ text: process.env.EMBED_FOOTER })
                    .setTimestamp();

                return interaction.reply({ 
                    embeds: [embed],
                    flags: MessageFlags.Ephemeral
                });
            }

            const noteEmbed = new EmbedBuilder()
                .setTitle(`${note[0].title}`)
                .setDescription(note[0].content)
                .setColor(process.env.COLOR_BLUE)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            if (ephemeral) {
                await interaction.reply({ 
                    embeds: [noteEmbed],
                    flags: MessageFlags.Ephemeral
                });
            } else {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('close').setLabel('X').setStyle(ButtonStyle.Danger)
                );

                const response = await interaction.reply({ 
                    embeds: [noteEmbed], 
                    components: [row], 
                    withResponse: true
                });

                const message = await interaction.fetchReply();

                const collector = message.createMessageComponentCollector({ time: 60000 });

                collector.on('collect', async (btn) => {
                    if (btn.user.id !== interaction.user.id) return btn.reply({ 
                        content: 'You cannot use this button.', 
                        flags: MessageFlags.Ephemeral 
                    });

                    if (btn.customId === 'close') {
                        // Delete the message.
                        await btn.message.delete();

                        // await btn.update({ embeds: [], components: [] });
                        return collector.stop();
                    }
                })
            }
        }

        if (subcommand === 'add') {
            const title = interaction.options.getString('title');
            const content = interaction.options.getString('content');

            await pool.query('INSERT INTO dcb_notes (user_id, title, content) VALUES (?, ?, ?)', [interaction.user.id, title, content]);
            
            const embed = new EmbedBuilder()
                .setTitle(':white_check_mark: Note added')
                .setDescription(`Successfully added note: **${title}**`)
                .setColor(process.env.COLOR_GREEN)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();
            
            await interaction.reply({ 
                embeds: [embed],
                flags: ephemeral ? MessageFlags.Ephemeral : undefined
            });
        }

        if (subcommand === 'remove') {
            const noteId = interaction.options.getString('id');
            const result = await pool.query('DELETE FROM dcb_notes WHERE user_id = ? AND id = ?', [interaction.user.id, noteId]);
            if (result.affectedRows > 0) {
                const embed = new EmbedBuilder()
                    .setTitle(':white_check_mark: Note removed')
                    .setDescription(`Successfully removed note with ID: ${noteId}`)
                    .setColor(process.env.COLOR_GREEN)
                    .setFooter({ text: process.env.EMBED_FOOTER })
                    .setTimestamp();

                await interaction.reply({ 
                    embeds: [embed],
                    flags: ephemeral ? MessageFlags.Ephemeral : undefined
                });
            } else {
                const embed = new EmbedBuilder()
                    .setTitle(':x: Note removal failed')
                    .setDescription(`Failed to remove note with ID: ${noteId}. Note may not exist.`)
                    .setColor(process.env.COLOR_RED)
                    .setFooter({ text: process.env.EMBED_FOOTER })
                    .setTimestamp();

                await interaction.reply({ 
                    embeds: [embed],
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
}
