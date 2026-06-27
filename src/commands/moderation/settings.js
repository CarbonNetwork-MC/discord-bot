const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionsBitField } = require('discord.js');

const { getDbPool } = require('../../services/database');
const { getGuildSettings, reloadSettingsForGuild } = require('../../config/guild-settings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('View the server settings')
        .addStringOption(option => 
            option.setName('set')
                .setDescription('The setting to change')
                .setRequired(false)
                .addChoices(
                    { name: 'Join Log Channel ID', value: 'join_log_id' },
                    { name: 'Mod Log Channel ID', value: 'mod_log_id' },
                    { name: 'System Log Channel ID', value: 'system_log_id' },
                    { name: 'Mute Role ID', value: 'mute_role_id' },
                    { name: 'Welcome Message', value: 'welcome_message' },
                    { name: 'Leave Message', value: 'leave_message' }
                )
            )
        .addStringOption(option => 
            option.setName('value')
                .setDescription('The new value for the setting')
                .setRequired(false)
        ),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const settings = getGuildSettings(guildId);
        if (!settings) {
            return interaction.reply({ content: 'No settings found for this server.', flags: MessageFlags.Ephemeral });
        }

        // If there are no options provided, display the current settings
        if (!interaction.options.getString('set')) {
            let joinLogChannel = settings.joinLogId ? `<#${settings.joinLogId}>` : 'Not set';
            let modLogChannel = settings.modLogId ? `<#${settings.modLogId}>` : 'Not set';
            let systemLogChannel = settings.systemLogId ? `<#${settings.systemLogId}>` : 'Not set';
            let muteRole = settings.muteRoleId ? `<@&${settings.muteRoleId}>` : 'Not set';
            let welcomeMessage = settings.welcomeMessage || 'Not set';
            let leaveMessage = settings.leaveMessage || 'Not set';

            const embed = new EmbedBuilder()
                .setTitle(`Server Settings for ${interaction.guild.name}`)
                .setColor(process.env.COLOR_BLUE)
                .addFields(
                    { name: 'Join Log Channel ID', value: joinLogChannel, inline: true },
                    { name: 'Mod Log Channel ID', value: modLogChannel, inline: true },
                    { name: 'System Log Channel ID', value: systemLogChannel, inline: true },
                    { name: 'Mute Role ID', value: muteRole, inline: true },
                    { name: 'Welcome Message', value: welcomeMessage, inline: false },
                    { name: 'Leave Message', value: leaveMessage, inline: false }
                )
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } else {
            // Handle setting changes here (this part is not implemented in the provided code)
            if (!interaction.options.getString('value'))
                return interaction.reply({ content: 'Please provide a value to set.', flags: MessageFlags.Ephemeral });

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) 
                return interaction.reply({ content: 'You do not have permission to change settings.', flags: MessageFlags.Ephemeral });

            const db = getDbPool();
            const settingToChange = interaction.options.getString('set');
            const newValue = interaction.options.getString('value');

            try {
                await db.query(`UPDATE dcb_guild_settings SET ${settingToChange} = ? WHERE guild_id = ?`, [newValue, guildId]);
                await reloadSettingsForGuild(guildId);
                return interaction.reply({ content: `Successfully updated **${settingToChange}** to **${newValue}**.`, flags: MessageFlags.Ephemeral });
            } catch (error) {
                console.error(error);
                return interaction.reply({ content: 'An error occurred while updating the setting.', flags: MessageFlags.Ephemeral });
            }
        }
    }
}