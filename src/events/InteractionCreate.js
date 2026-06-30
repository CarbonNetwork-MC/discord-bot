const { Events, MessageFlags } = require('discord.js');
const { consoleLog, writeLogToFile } = require('../services/logger.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    execute: async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            consoleLog('warning', `No command matching ${interaction.commandName} was found.`)
            writeLogToFile('warning', `No command matching ${interaction.commandName} was found.`);
            return;
        }

        // Check if the command is restricted to certain users
        if (command.allowedUsers !== null) {
            if (!Array.isArray(command.allowedUsers)) {
                consoleLog(
                    'warning',
                    `Command ${command.data.name} has an invalid allowedUsers property.`
                );

                return;
            }

            if (!command.allowedUsers.includes(interaction.user.id)) {
                return interaction.reply({
                    content: 'You are not allowed to use this command.',
                    flags: MessageFlags.Ephemeral,
                });
            }
        }

        // Check if the user has the required permissions to execute the command
        if (command.requiredPermissions !== null) {
            if (!Array.isArray(command.requiredPermissions)) {
                consoleLog(
                    'warning',
                    `Command ${command.data.name} has an invalid requiredPermissions property.`
                );
                return;
            }

            const member = interaction.member;
            const missingPermissions = command.requiredPermissions.filter(
                (perm) => !member.permissions.has(perm)
            );

            if (missingPermissions.length > 0) {
                return interaction.reply({
                    content: `You do not have the required permissions to use this command. Missing permissions: ${missingPermissions.join(', ')}`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            consoleLog('error', `Error executing command ${interaction.commandName}: ${error}`);
            writeLogToFile('error', `Error executing command ${interaction.commandName}: ${error}`);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            }
        }
    }
}