const { Events, EmbedBuilder, ChannelType } = require('discord.js');
const { consoleLog } = require('../src/logger.js');
const { guildSettings } = require('../src/guild-settings.js');
const { compareOverwrites } = require('../utils/compareOverwrites');

module.exports = {
    name: Events.ChannelCreate,
    once: false,
    execute: (channel) => {
        const logChannel = channel.guild.channels.cache.find(ch => ch.id === guildSettings[channel.guild.id]?.modLogId);
        if (!logChannel) return;

        // Format channel type
        const typeName = TYPE_LABELS[channel.type] || 'Unknown';

        // Role overrides (new channel vs. empty old state)
        const permChanges = compareOverwrites(
            new Map(), // old perms (none for a new channel)
            channel.permissionOverwrites.cache,
            channel.guild
        );

        const embed = new EmbedBuilder()
            .setTitle(':sparkles: Channel created')
            .setDescription(
                `**Name:** ${channel.name}\n` +
                `**Category:** ${channel.parent?.name ?? 'None'}\n` +
                `**ID:** ${channel.id}\n` +
                `**Type:** ${typeName}\n\n` +
                (permChanges ? `**Role Overrides:**\n${permChanges}` : 'No specific role overrides')
            )
            .setColor(process.env.COLOR_GREEN)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    }
};

function formatPermissions(perms) {
    return perms
        .map(perm => PERMISSION_LABELS[perm] || perm)
        .join(', ');
}

// Map of Discord permission names -> Human-readable names
const PERMISSION_LABELS = {
    AddReactions: 'Add Reactions',
    Administrator: 'Administrator',
    AttachFiles: 'Attach Files',
    BanMembers: 'Ban Members',
    ChangeNickname: 'Change Nickname',
    Connect: 'Connect to Voice',
    CreateInstantInvite: 'Create Invite',
    CreatePrivateThreads: 'Create Private Threads',
    CreatePublicThreads: 'Create Public Threads',
    DeafenMembers: 'Deafen Members',
    EmbedLinks: 'Embed Links',
    KickMembers: 'Kick Members',
    ManageChannels: 'Manage Channels',
    ManageEmojisAndStickers: 'Manage Emojis & Stickers',
    ManageEvents: 'Manage Events',
    ManageGuild: 'Manage Server',
    ManageMessages: 'Manage Messages',
    ManageNicknames: 'Manage Nicknames',
    ManageRoles: 'Manage Roles',
    ManageThreads: 'Manage Threads',
    ManageWebhooks: 'Manage Webhooks',
    MentionEveryone: 'Mention @everyone, @here',
    ModerateMembers: 'Timeout Members',
    MoveMembers: 'Move Members',
    MuteMembers: 'Mute Members',
    PrioritySpeaker: 'Priority Speaker',
    ReadMessageHistory: 'Read Message History',
    RequestToSpeak: 'Request to Speak',
    SendMessages: 'Send Messages',
    SendMessagesInThreads: 'Send in Threads',
    SendTTSMessages: 'Send TTS Messages',
    Speak: 'Speak in Voice',
    Stream: 'Video/Stream in Voice',
    UseApplicationCommands: 'Use Slash Commands',
    UseEmbeddedActivities: 'Use Activities',
    UseExternalEmojis: 'Use External Emojis',
    UseExternalStickers: 'Use External Stickers',
    UseVAD: 'Use Voice Activity',
    ViewAuditLog: 'View Audit Log',
    ViewChannel: 'View Channel',
    ViewGuildInsights: 'View Server Insights'
};

const TYPE_LABELS = {
    [ChannelType.GuildText]: 'Text Channel',
    [ChannelType.GuildVoice]: 'Voice Channel',
    [ChannelType.GuildCategory]: 'Category',
    [ChannelType.GuildAnnouncement]: 'Announcement Channel',
    [ChannelType.AnnouncementThread]: 'Announcement Thread',
    [ChannelType.PublicThread]: 'Public Thread',
    [ChannelType.PrivateThread]: 'Private Thread',
    [ChannelType.GuildStageVoice]: 'Stage Channel',
    [ChannelType.GuildForum]: 'Forum Channel',
    [ChannelType.DM]: 'Direct Message',
};