const { Events } = require('discord.js');
const { consoleLog } = require('../src/logger.js');

module.exports = {
    name: Events.ChannelCreate,
    once: false,
    execute: (channel) => {
        consoleLog('info', `Channel created: ${channel.name} (${channel.id}) in ${channel.guild.name}`);
    }
}