const { Events } = require('discord.js');
const { consoleLog } = require('../src/logger.js');

module.exports = {
    name: Events.ChannelDelete,
    once: false,
    execute: (channel) => {
        consoleLog('info', `Channel deleted: ${channel.name} (${channel.id}) in ${channel.guild.name}`);
    }
}