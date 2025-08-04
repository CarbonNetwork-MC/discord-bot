const database = require('./database');
const { consoleLog } = require('./logger');

const guildSettings = {};

const loadGuildSettings = async () => {
    const [settings] = await database.getDbPool().query('SELECT * FROM dcb_guild_settings');
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

module.exports = {
    guildSettings,
    loadGuildSettings,
};