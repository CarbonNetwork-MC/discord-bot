const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const db = require('../../src/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('notes')
        .setDescription('Manage your personal notes')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Get a list of your notes')
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

                const notesMap = pageNotes.map(note => `**[${note.id}]:** ${note.title}`).join('\n');
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
            row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('prev').setLabel('<').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('next').setLabel('>').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('close').setLabel('X').setStyle(ButtonStyle.Danger)
            );

            // Send message
            const message = await interaction.reply({
                embeds: [getEmbed(page)],
                components: [row],
                fetchReply: true
            });

            const closeEmbed = new EmbedBuilder()
                .setDescription('Notes closed.')
                .setColor(process.env.EMBED_COLOR_RED)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            const collector = message.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async (btn) => {
                if (btn.user.id !== interaction.user.id) return btn.reply({ content: 'You cannot use this button.', ephemeral: true });

                if (btn.customId === 'prev') page = Math.max(0, page - 1);
                if (btn.customId === 'next') page = Math.min(totalPages - 1, page + 1);
                if (btn.customId === 'close') {
                    await btn.update({ embeds: [closeEmbed], components: [] });
                    return collector.stop();
                }

                await btn.update({ embeds: [getEmbed(page)], components: [row] });
            })

            collector.on('end', () => {
                message.edit({ embeds: [closeEmbed], components: [] }).catch(() => {});
            });
        }

        if (subcommand === 'view') {
            const noteId = interaction.options.getString('id');
            const [note] = await pool.query('SELECT * FROM dcb_notes WHERE user_id = ? AND id = ?', [interaction.user.id, noteId]);
            if (note.length === 0) {
                return interaction.reply(`No note found with ID ${noteId}.`);
            }

            const noteEmbed = new EmbedBuilder()
                .setTitle(`${note[0].title}`)
                .setDescription(note[0].content)
                .setColor(process.env.COLOR_BLUE)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('close').setLabel('X').setStyle(ButtonStyle.Danger)
            );

            const message = await interaction.reply({ embeds: [noteEmbed], components: [row], fetchReply: true });

            const collector = message.createMessageComponentCollector({ time: 10000 });

            collector.on('collect', async (btn) => {
                if (btn.user.id !== interaction.user.id) return btn.reply({ content: 'You cannot use this button.', ephemeral: true });

                if (btn.customId === 'close') {
                    // Delete the message.
                    await btn.message.delete();

                    // await btn.update({ embeds: [], components: [] });
                    return collector.stop();
                }
            })
        }

        if (subcommand === 'add') {
            const title = interaction.options.getString('title');
            const content = interaction.options.getString('content');

            await pool.query('INSERT INTO dcb_notes (user_id, title, content) VALUES (?, ?, ?)', [interaction.user.id, title, content]);
            await interaction.reply(`Note added: **${title}**`);
        }

        if (subcommand === 'remove') {
            const noteId = interaction.options.getString('id');
            const result = await pool.query('DELETE FROM dcb_notes WHERE user_id = ? AND id = ?', [interaction.user.id, noteId]);
            if (result.affectedRows > 0) {
                await interaction.reply(`Note with ID ${noteId} removed.`);
            } else {
                await interaction.reply(`No note found with ID ${noteId}.`);
            }
        }
    }
}
