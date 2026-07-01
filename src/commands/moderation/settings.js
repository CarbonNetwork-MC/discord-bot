const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionsBitField } = require('discord.js');

const { getDbPool } = require('../../services/database');
const { getGuildSettings, reloadSettingsForGuild } = require('../../services/guild-settings');

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: [
        'ManageGuild',
    ],
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('View or change server settings')

        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View the current server settings')
        )

        .addSubcommand(sub =>
            sub.setName('set-toggle')
                .setDescription('Enable or disable welcome/leave messages')
                .addStringOption(option =>
                    option.setName('setting')
                    .setDescription('Toggle setting')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Welcome Enabled', value: 'welcome_enabled' },
                        { name: 'Leave Enabled', value: 'leave_enabled' },
                    )
                )
                .addBooleanOption(option =>
                    option.setName('value')
                    .setDescription('Enabled or disabled')
                    .setRequired(true)
                )
        )

        .addSubcommand(sub =>
            sub.setName('set-channel')
                .setDescription('Set a log channel')
                .addStringOption(option =>
                    option.setName('setting')
                    .setDescription('Channel setting')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Join Log Channel', value: 'join_log_id' },
                        { name: 'Mod Log Channel', value: 'mod_log_id' },
                        { name: 'System Log Channel', value: 'system_log_id' },
                    )
                )
                .addChannelOption(option =>
                    option.setName('channel')
                    .setDescription('The channel to use')
                    .setRequired(true)
                )
        )

        .addSubcommand(sub =>
            sub.setName('set-role')
                .setDescription('Set the mute role')
                .addRoleOption(option =>
                    option.setName('role')
                    .setDescription('The mute role')
                    .setRequired(true)
                )
        )

        .addSubcommand(sub =>
            sub.setName('set-message')
                .setDescription('Set a welcome or leave message')
                .addStringOption(option =>
                    option.setName('setting')
                    .setDescription('Message setting')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Welcome Message', value: 'welcome_message' },
                        { name: 'Leave Message', value: 'leave_message' },
                    )
                )
                .addStringOption(option =>
                    option.setName('message')
                    .setDescription('The message text')
                    .setRequired(true)
                )
        ),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const settings = getGuildSettings(guildId);
        if (!settings) {
            return interaction.reply({ 
                content: 'No settings found for this server.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        const db = getDbPool();

        const allowedSettings = new Set([
            'join_log_id',
            'mod_log_id',
            'system_log_id',
            'mute_role_id',
            'welcome_message',
            'leave_message',
            'welcome_enabled',
            'leave_enabled',
        ]);

        async function updateSetting(setting, value) {
            if (!allowedSettings.has(setting)) {
                throw new Error(`Invalid setting: ${setting}`);
            }

            await db.query(
                `UPDATE dcb_guild_settings SET \`${setting}\` = ? WHERE guild_id = ?`,
                [value, guildId]
            );

            await reloadSettingsForGuild(guildId);
        }

        const subcommand = interaction.options.getSubcommand();

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({
                content: 'You do not have permission to change settings.',
                flags: MessageFlags.Ephemeral,
            });
        }

        if (subcommand === 'view') {
            let joinLogChannel = settings.joinLogId ? `<#${settings.joinLogId}>` : 'Not set';
            let modLogChannel = settings.modLogId ? `<#${settings.modLogId}>` : 'Not set';
            let systemLogChannel = settings.systemLogId ? `<#${settings.systemLogId}>` : 'Not set';
            let muteRole = settings.muteRoleId ? `<@&${settings.muteRoleId}>` : 'Not set';
            let welcomeMessage = settings.welcomeMessage || 'Not set';
            let leaveMessage = settings.leaveMessage || 'Not set';
            let welcomeEnabled = settings.welcomeEnabled ? ':white_check_mark: Enabled' : ':x: Disabled';
            let leaveEnabled = settings.leaveEnabled ? ':white_check_mark: Enabled' : ':x: Disabled';

            const embed = new EmbedBuilder()
                .setTitle(`Server Settings for ${interaction.guild.name}`)
                .setColor(process.env.COLOR_BLUE)
                .addFields(
                    { name: 'Join Log Channel ID', value: joinLogChannel, inline: true },
                    { name: 'Mod Log Channel ID', value: modLogChannel, inline: true },
                    { name: 'System Log Channel ID', value: systemLogChannel, inline: true },
                    { name: 'Mute Role ID', value: muteRole, inline: true },
                    { name: 'Welcome Message', value: welcomeMessage, inline: false },
                    { name: 'Leave Message', value: leaveMessage, inline: false },
                    { name: 'Welcome Enabled', value: welcomeEnabled, inline: true },
                    { name: 'Leave Enabled', value: leaveEnabled, inline: true }
                )
                .setFooter({ text: process.env.EMBED_FOOTER })
                .setTimestamp();

            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        if (subcommand === 'set-toggle') {
            const setting = interaction.options.getString('setting', true);
            const value = interaction.options.getBoolean('value', true) ? 1 : 0;

            await updateSetting(setting, value);

            return interaction.reply({
                content: `Successfully updated **${setting}** to **${value ? 'enabled' : 'disabled'}**.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        if (subcommand === 'set-channel') {
            const setting = interaction.options.getString('setting', true);
            const channel = interaction.options.getChannel('channel', true);

            await updateSetting(setting, channel.id);

            return interaction.reply({
                content: `Successfully updated **${setting}** to ${channel}.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        if (subcommand === 'set-role') {
            const role = interaction.options.getRole('role', true);

            await updateSetting('mute_role_id', role.id);

            return interaction.reply({
                content: `Successfully updated **Mute Role** to ${role}.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        if (subcommand === 'set-message') {
            const setting = interaction.options.getString('setting', true);
            const message = interaction.options.getString('message', true);

            await updateSetting(setting, message);

            return interaction.reply({
                content: `Successfully updated **${setting}**.`,
                flags: MessageFlags.Ephemeral,
            });
        }



        // const guildId = interaction.guild.id;
        // const settings = getGuildSettings(guildId);
        // if (!settings) {
        //     return interaction.reply({ content: 'No settings found for this server.', flags: MessageFlags.Ephemeral });
        // }

        // // If there are no options provided, display the current settings
        // if (!interaction.options.getString('set')) {
        //     let joinLogChannel = settings.joinLogId ? `<#${settings.joinLogId}>` : 'Not set';
        //     let modLogChannel = settings.modLogId ? `<#${settings.modLogId}>` : 'Not set';
        //     let systemLogChannel = settings.systemLogId ? `<#${settings.systemLogId}>` : 'Not set';
        //     let muteRole = settings.muteRoleId ? `<@&${settings.muteRoleId}>` : 'Not set';
        //     let welcomeMessage = settings.welcomeMessage || 'Not set';
        //     let leaveMessage = settings.leaveMessage || 'Not set';
        //     let welcomeEnabled = settings.welcomeEnabled ? ':white_check_mark: Enabled' : ':x: Disabled';
        //     let leaveEnabled = settings.leaveEnabled ? ':white_check_mark: Enabled' : ':x: Disabled';

        //     const embed = new EmbedBuilder()
        //         .setTitle(`Server Settings for ${interaction.guild.name}`)
        //         .setColor(process.env.COLOR_BLUE)
        //         .addFields(
        //             { name: 'Join Log Channel ID', value: joinLogChannel, inline: true },
        //             { name: 'Mod Log Channel ID', value: modLogChannel, inline: true },
        //             { name: 'System Log Channel ID', value: systemLogChannel, inline: true },
        //             { name: 'Mute Role ID', value: muteRole, inline: true },
        //             { name: 'Welcome Message', value: welcomeMessage, inline: false },
        //             { name: 'Leave Message', value: leaveMessage, inline: false },
        //             { name: 'Welcome Enabled', value: welcomeEnabled, inline: true },
        //             { name: 'Leave Enabled', value: leaveEnabled, inline: true }
        //         )
        //         .setFooter({ text: process.env.EMBED_FOOTER })
        //         .setTimestamp();

        //     return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        // } else {
        //     // Handle setting changes here (this part is not implemented in the provided code)
        //     if (!interaction.options.getString('value'))
        //         return interaction.reply({ content: 'Please provide a value to set.', flags: MessageFlags.Ephemeral });

        //     if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) 
        //         return interaction.reply({ content: 'You do not have permission to change settings.', flags: MessageFlags.Ephemeral });

        //     const db = getDbPool();
        //     const settingToChange = interaction.options.getString('set');
        //     const newValue = interaction.options.getString('value');

        //     try {
        //         await db.query(`UPDATE dcb_guild_settings SET ${settingToChange} = ? WHERE guild_id = ?`, [newValue, guildId]);
        //         await reloadSettingsForGuild(guildId);
        //         return interaction.reply({ content: `Successfully updated **${settingToChange}** to **${newValue}**.`, flags: MessageFlags.Ephemeral });
        //     } catch (error) {
        //         console.error(error);
        //         return interaction.reply({ content: 'An error occurred while updating the setting.', flags: MessageFlags.Ephemeral });
        //     }
        // }
    }
}