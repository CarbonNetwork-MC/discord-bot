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