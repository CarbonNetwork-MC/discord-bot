const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: subcommand =>
        subcommand
            .setName('diagnose')
            .setDescription('Diagnose a role.')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to diagnose.')
                    .setRequired(true)
            ),

    async execute(interaction) {
        const role = interaction.options.getRole('role');

        let yes = ':white_check_mark:';
        let no = ':x:';

        const description = `Diagnosing role: <@&${role.id}> (${role.id})`
            + `\n\n**Role is Managed:** ${role.managed ? yes : no}`
            + `\n**Role is Mentionable:** ${role.mentionable ? yes : no}`
            + `\n**Role is displayed separately:** ${role.hoist ? yes : no}`
            + `\n**Role is Editable:** ${role.editable ? yes : no}`
            + `\n**Can manage Roles for Me:** ${interaction.guild.members.me.permissions.has('ManageRoles') ? yes : no}`
            + `\n**Can manage Roles for You:** ${interaction.member.permissions.has('ManageRoles') ? yes : no}`
            + `\n**Role is higher than my highest role:** ${role.position > interaction.guild.members.me.roles.highest.position ? yes : no}`
            + `\n**Role is higher than your highest role:** ${role.position > interaction.member.roles.highest.position ? yes : no}`
            + `\n\n**Role Color:** ${role.hexColor}`;

        const embed = new EmbedBuilder()
            .setTitle(`Role Diagnosis`)
            .setDescription(description)
            .setImage(`https://singlecolorimage.com/get/${role.hexColor.replace('#', '')}/100x100`)
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        return interaction.reply({
            embeds: [embed],
        });
    }
}