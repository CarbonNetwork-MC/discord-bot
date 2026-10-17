const { guildSettings, getModLogId, getSystemLogId, getJoinLogId } = require('../services/guild-settings.js');

function checkModlogChannel(guild) {
    const modLogId = getModLogId(guild.id);

    // Check if modLogId is defined and not null
    if (!modLogId) return false;

    // Check if the channel exists in the guild
    const modLogChannel = guild.channels.cache.get(modLogId);
    if (!modLogChannel) return false;

    return true;
}

function checkJoinlogChannel(guild) {
    const joinLogId = getJoinLogId(guild.id);

    // Check if joinLogId is defined and not null
    if (!joinLogId) return false;

    // Check if the channel exists in the guild
    const joinLogChannel = guild.channels.cache.get(joinLogId);
    if (!joinLogChannel) return false;

    return true;
}

function getModLogChannel(guild) {
    const modLogId = getModLogId(guild.id);

    // Check if modLogId is defined and not null
    if (!modLogId) return null;

    // Check if the channel exists in the guild
    const modLogChannel = guild.channels.cache.get(modLogId);
    if (!modLogChannel) return null;

    return modLogChannel;
}

function getJoinLogChannel(guild) {
    const joinLogId = getJoinLogId(guild.id);

    // Check if joinLogId is defined and not null
    if (!joinLogId) return null;

    // Check if the channel exists in the guild
    const joinLogChannel = guild.channels.cache.get(joinLogId);
    if (!joinLogChannel) return null;

    return joinLogChannel;
}

function getSystemLogChannel(guild) {
    const systemLogId = getSystemLogId(guild.id);

    // Check if systemLogId is defined and not null
    if (!systemLogId) return null;

    // Check if the channel exists in the guild
    const systemLogChannel = guild.channels.cache.get(systemLogId);
    if (!systemLogChannel) return null;

    return systemLogChannel;
}

module.exports = { 
    checkModlogChannel,
    checkJoinlogChannel,
    getModLogChannel,
    getJoinLogChannel,
    getSystemLogChannel
};