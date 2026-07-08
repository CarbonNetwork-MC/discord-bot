const { EmbedBuilder, MessageFlags } = require("discord.js");

const { consoleLog, writeLogToFile } = require('../../../../services/logger.js');

module.exports = {
    data: subcommand =>
        subcommand
            .setName('create')
            .setDescription('Create a new role in the server.')
            .addStringOption(option =>
                option.setName('name')
                    .setDescription('The name of the new role.')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('color')
                    .setDescription('The color of the new role (hex code).')
                    .setRequired(false)
            )
            .addBooleanOption(option =>
                option.setName('hoist')
                    .setDescription('Whether the role should be displayed separately in the member list.')
                    .setRequired(false)
            )
            .addBooleanOption(option =>
                option.setName('mentionable')
                    .setDescription('Whether the role should be mentionable.')
                    .setRequired(false)
            ),

    async execute(interaction) {
        const name = interaction.options.getString('name');
        const color = interaction.options.getString('color') || null;
        const hoist = interaction.options.getBoolean('hoist') || false;
        const mentionable = interaction.options.getBoolean('mentionable') || false;

        try {
            const colors = {
                primaryColor: color || 0x000000,
            }

            const role = await interaction.guild.roles.create({
                name: name,
                colors: colors,
                hoist: hoist,
                mentionable: mentionable,
            });

            const embed = new EmbedBuilder()
                .setTitle('Role Created')
                .setDescription(`Successfully created the role **${role.name}**.`)
                .setColor(role.color || 0x00FF00)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            consoleLog('error', `Error creating role: ${error.message}`);
            writeLogToFile('error', `Error creating role: ${error.message}`);
            return interaction.reply({
                content: 'There was an error while creating the role.',
                flags: MessageFlags.Ephemeral,
            });
        }
    }
}