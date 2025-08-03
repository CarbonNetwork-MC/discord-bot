const { Events } = require('discord.js');
const { consoleLog } = require('../src/logger.js');

module.exports = {
    name: Events.VoiceStateUpdate,
    once: false,
    execute: (oldState, newState) => {
        // Log voice state updates
        consoleLog('info', `Voice state updated for user: ${newState.member.user.tag}`);
        
        // Example: Log when a user joins or leaves a voice channel
        if (!oldState.channelId && newState.channelId) {
            consoleLog('info', `${newState.member.user.tag} joined ${newState.channel.name}`);
        } else if (oldState.channelId && !newState.channelId) {
            consoleLog('info', `${newState.member.user.tag} left ${oldState.channel.name}`);
        }

        // Example: Log when a user switches voice channels
        if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            consoleLog('info', `${newState.member.user.tag} switched from ${oldState.channel.name} to ${newState.channel.name}`);
        }
    }
}