const database = require('./database');
const { consoleLog } = require('./logger');

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
            muteRoleId: setting.mute_role_id,
            welcomeMessage: setting.welcome_message,
            leaveMessage: setting.leave_message,
        };
    });

    consoleLog('system', 'Guild settings loaded successfully.');
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

function getMuteRoleId(guildId) {
    return guildSettings[guildId]?.muteRoleId ?? null;
}

function getWelcomeMessage(guildId) {
    return guildSettings[guildId]?.welcomeMessage ?? null;
}

function getLeaveMessage(guildId) {
    return guildSettings[guildId]?.leaveMessage ?? null;
}

module.exports = {
    guildSettings, // ! DEPRECATED: Use the getter functions instead of accessing this object directly
    loadGuildSettings,
    getGuildSettings,
    getJoinLogId,
    getModLogId,
    getMuteRoleId,
    getWelcomeMessage,
    getLeaveMessage,
};