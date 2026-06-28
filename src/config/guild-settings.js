const database = require('../services/database.js');
const { consoleLog } = require('../services/logger.js');

const guildSettings = {};

const loadGuildSettings = async () => {
    consoleLog('system', 'Loading guild settings...');

    const pool = database.getDbPool();

    const [settings] = await pool.query('SELECT * FROM dcb_guild_settings');

    consoleLog('system', `Fetched ${settings.length} guild settings`);

    settings.forEach(setting => {
        guildSettings[setting.guild_id] = {
            joinLogId: setting.join_log_id,
            modLogId: setting.mod_log_id,
            systemLogId: setting.system_log_id,
            muteRoleId: setting.mute_role_id,
            welcomeEnabled: setting.welcome_enabled,
            welcomeMessage: setting.welcome_message,
            leaveEnabled: setting.leave_enabled,
            leaveMessage: setting.leave_message,
        };
    });

    consoleLog('system', 'Guild settings loaded successfully.');
};

const reloadSettingsForGuild = async (guildId) => {
    const pool = database.getDbPool();
    const [settings] = await pool.query('SELECT * FROM dcb_guild_settings WHERE guild_id = ?', [guildId]);

    if (settings.length === 0) {
        delete guildSettings[guildId];
        return;
    }

    const setting = settings[0];
    guildSettings[guildId] = {
        joinLogId: setting.join_log_id,
        modLogId: setting.mod_log_id,
        systemLogId: setting.system_log_id,
        muteRoleId: setting.mute_role_id,
        welcomeEnabled: setting.welcome_enabled,
        welcomeMessage: setting.welcome_message,
        leaveEnabled: setting.leave_enabled,
        leaveMessage: setting.leave_message,
    };
};

function getGuildSettings(guildId) {
    return guildSettings[guildId] ?? null;
}

function getJoinLogId(guildId) {
    return guildSettings[guildId]?.joinLogId ?? null;
}

function getModLogId(guildId) {
    return guildSettings[guildId]?.modLogId ?? null;
}

function getSystemLogId(guildId) {
    return guildSettings[guildId]?.systemLogId ?? null;
}

function getMuteRoleId(guildId) {
    return guildSettings[guildId]?.muteRoleId ?? null;
}

function isWelcomeEnabled(guildId) {
    return guildSettings[guildId]?.welcomeEnabled ?? false;
}

function getWelcomeMessage(guildId) {
    return guildSettings[guildId]?.welcomeMessage ?? null;
}

function isLeaveEnabled(guildId) {
    return guildSettings[guildId]?.leaveEnabled ?? false;
}

function getLeaveMessage(guildId) {
    return guildSettings[guildId]?.leaveMessage ?? null;
}

module.exports = {
    loadGuildSettings,
    reloadSettingsForGuild,
    getGuildSettings,
    getJoinLogId,
    getModLogId,
    getSystemLogId,
    getMuteRoleId,
    isWelcomeEnabled,
    getWelcomeMessage,
    isLeaveEnabled,
    getLeaveMessage,
};