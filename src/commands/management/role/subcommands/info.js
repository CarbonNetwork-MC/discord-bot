const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: subcommand =>
        subcommand
            .setName('info')
            .setDescription('Displays information about a role.')
            .addRoleOption(option =>
                option
                    .setName('role')
                    .setDescription('The role to display information about.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        const role = interaction.options.getRole('role');

        let embed = new EmbedBuilder()
            .setTitle(`Information for role ${role.name}`)
            .addFields(
                { name: 'Name', value: `<@&${role.id}>`, inline: true },
                { name: 'ID', value: role.id, inline: true },
                { name: 'Color', value: role.hexColor, inline: true },
                { name: 'Position', value: role.position.toString(), inline: true },
                { name: 'Hoist', value: role.hoist ? 'Yes' : 'No', inline: true },
                { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
                { name: 'Members', value: role.members.size.toString(), inline: true },
                { name: 'Created At', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`, inline: true }
            )
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        await interaction.reply({ 
            embeds: [embed] 
        });
    }
}