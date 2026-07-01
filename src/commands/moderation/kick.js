const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const { consoleLog, writeLogToFile } = require('../../services/logger.js');
const { getModLogChannel } = require('../../utils/channelUtils.js');

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: [
        'KickMembers'
    ],
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user from the server')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to kick')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for the kick')
                .setRequired(false)
        ),
    async execute(interaction) {
        // Fetch the user and reason from the command options
        const user = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const moderator = interaction.user;

        // Attempt to kick the user
        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.kick(reason);

            const embed = new EmbedBuilder()
                .setTitle(':white_check_mark: User Kicked')
                .setDescription(`Successfully kicked <@${user.id}> from the server.`)
                .addFields(
                    { name: 'Reason', value: reason },
                    { name: 'Moderator', value: `<@${moderator.id}>` }
                )
                .setColor(process.env.COLOR_GREEN)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            await interaction.reply({ 
                embeds: [embed],
                flags: MessageFlags.Ephemeral
            });

            const modLogChannel = await getModLogChannel(interaction.guild);
            if (!modLogChannel) return;

            const modlogEmbed = new EmbedBuilder()
                .setTitle(':warning: User Kicked')
                .setDescription(`<@${user.id}> has been kicked from the server.`)
                .addFields(
                    { name: 'Reason', value: reason },
                    { name: 'Moderator', value: `${moderator.tag} (<@${moderator.id}>)` }
                )
                .setColor(process.env.COLOR_RED)
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            modLogChannel.send({
                embeds: [modlogEmbed]
            });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setTitle(':x: Error Kicking User')
                .setDescription(`Failed to kick <@${user.id}>. They may not be in the server or I may not have permission to kick them.`)
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