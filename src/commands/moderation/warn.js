const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const { consoleLog, writeLogToFile } = require('../../services/logger');
const { getTimeoutDuration1, getTimeoutDuration2 } = require('../../config/guild-settings');
const punishmentApplier = require('../../utils/punishmentApplier');
const { getModLogChannel } = require('../../utils/channelUtils');

module.exports = {
    isDev: true,
    servers: null,
    allowedUsers: null,
    requiredPermissions: [
        'KickMembers',
        'ModerateMembers',
    ],
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user')  
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the warning')
                .setRequired(true)
        ),
    async execute(interaction) {
        const modLogChannel = await getModLogChannel(interaction.guild);
        if (!modLogChannel) {
            await interaction.reply({ content: 'Mod log channel not found. Please set up a mod log channel first.', flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            let result = await punishmentApplier.addWarn(interaction);

            if (!result.success) {
                await punishmentApplier.revertWarn(result.id);
                return interaction.reply({ content: 'Failed to add warn.', flags: MessageFlags.Ephemeral });
            }

            // Reply with the result of adding the warn
            await interaction.reply({
                embeds: [result.embed],
            })

            // Send the warn embed to the modlog channel
            await modLogChannel.send({ 
                embeds: [result.modlogEmbed], 
            });

            // 1.
            if (result.warns == 1) {
                let duration = getTimeoutDuration1(interaction.guild.id);
                let resultWarn = await punishmentApplier.applyTimeout(
                    interaction.guild, 
                    interaction.options.getUser('user'), 
                    duration, 
                    `Warn 1 | ` + interaction.options.getString('reason'), 
                    interaction.user
                );

                if (!resultWarn.success)
                    await punishmentApplier.revertWarn(result.id);

                await modLogChannel.send({
                    embeds: [resultWarn.embed],
                });
            }

            // 2. 
            else if (result.warns == 2) {
                let duration = getTimeoutDuration2(interaction.guild.id);
                let resultWarn = await punishmentApplier.applyTimeout(
                    interaction.guild, 
                    interaction.options.getUser('user'), 
                    duration, 
                    `Warn 2 | ` + interaction.options.getString('reason'), 
                    interaction.user
                );

                if (!resultWarn.success)
                    await punishmentApplier.revertWarn(result.id);

                await modLogChannel.send({ 
                    embeds: [resultWarn.embed], 
                });
            }

            // 3.
            else if (result.warns == 3) {
                let resultWarn = await punishmentApplier.applyKick(
                    interaction.guild, 
                    interaction.options.getUser('user'), 
                    `Warn 3 | ` + interaction.options.getString('reason'), 
                    interaction.user
                );

                if (!resultWarn.success)
                    await punishmentApplier.revertWarn(result.id);

                await modLogChannel.send({ 
                    embeds: [resultWarn.embed], 
                });
            }

            // 4.
            else if (result.warns == 4) {
                let resultWarn = await punishmentApplier.applyBan(
                    interaction.guild, 
                    interaction.options.getUser('user'), 
                    `Warn 4 | ` + interaction.options.getString('reason'), 
                    interaction.user
                );

                if (!resultWarn.success)
                    await punishmentApplier.revertWarn(result.id);

                await modLogChannel.send({ 
                    embeds: [resultWarn.embed], 
                });
            }

            // 5.
            else if (result.warns >= 5) {
                let resultWarn = await punishmentApplier.applyPermBan(
                    interaction.guild, 
                    interaction.options.getUser('user'), 
                    `Warn 5+ | ` + interaction.options.getString('reason') + ` | PERMANENT BAN`, 
                    interaction.user
                );

                if (!resultWarn.success)
                    await punishmentApplier.revertWarn(result.id);

                await modLogChannel.send({ 
                    embeds: [resultWarn.embed], 
                });
            }
        } catch (err) {
            consoleLog('error', `Error executing warn command: ${err}`);
            writeLogToFile(`Error executing warn command: ${err}`);
            await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
        }
    }
}
