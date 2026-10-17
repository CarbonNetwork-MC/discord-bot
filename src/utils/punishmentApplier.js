const { EmbedBuilder, MessageFlags } = require('discord.js');

const { getModLogChannel } = require('./channelUtils.js');
const { formatTime } = require('./timeFormatter');
const { getGuildSettings } = require('../services/guild-settings.js');
const { getDbPool } = require('../services/database.js');
const { consoleLog, writeLogToFile } = require('../services/logger.js');

async function getWarns(interaction) {
    const db = getDbPool();
    const guildId = interaction.guild.id;
    const userId = interaction.options.getUser('user').id;
    
    const [rows] = await db.query('SELECT * FROM dcb_warns WHERE guild_id = ? AND user_id = ?', [guildId, userId]);
    return rows;
}

async function getWarnsByUserId(guildId, userId) {
    const db = getDbPool();
    const [rows] = await db.query('SELECT * FROM dcb_warns WHERE guild_id = ? AND user_id = ?', [guildId, userId]);
    return rows;
}

async function createErrorEmbed(title, description) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(process.env.COLOR_RED)
        .setFooter({ text: process.env.EMBED_FOOTER })
        .setTimestamp();
    return embed;
}

async function addWarn(interaction) {
    const db = getDbPool();
    const guildId = interaction.guild.id;
    const userId = interaction.options.getUser('user').id;
    const reason = interaction.options.getString('reason');
    const moderator = interaction.user;

    let [result] = await db.query(
        'INSERT INTO dcb_warns (guild_id, user_id, reason, moderator_id) VALUES (?, ?, ?, ?)',
        [guildId, userId, reason, moderator.id]
    );

    let numberOfWarns = await getWarnsByUserId(guildId, userId).then(rows => rows.length).catch(err => { console.error('Error fetching warns after adding:', err); return 0; });
    const embed = new EmbedBuilder()
        .setTitle(`User Warned`)
        .setDescription(`User <@${userId}> has been warned.`)
        .addFields(
            { name: 'Reason', value: reason },
        )
        .setColor(process.env.COLOR_YELLOW)
        .setFooter({ text: process.env.EMBED_FOOTER })
        .setTimestamp();

    const modlogEmbed = new EmbedBuilder(embed.toJSON())
        .addFields(
            { name: 'Moderator', value: `${moderator.tag} (<@${moderator.id}>)` },
            { name: 'Total Warns', value: `${numberOfWarns}` }
        );

    return { success: true, warns: numberOfWarns, id: result.insertId, embed: embed, modlogEmbed: modlogEmbed };
}

async function revertWarn(id) {
    const db = getDbPool();
    await db.query('DELETE FROM dcb_warns WHERE id = ?', [id]);
}

async function applyTimeout(guild, user, duration, reason, moderator) {
    const member = await guild.members.fetch(user.id).catch(err => {
        consoleLog('error', `Failed to fetch member ${user.id} in guild ${guild.id}: ${err}`);
        writeLogToFile(`Failed to fetch member ${user.id} in guild ${guild.id}: ${err}`);
        return null;
    });

    if (!member) {
        return { success: false, embed: await createErrorEmbed('Error', `Failed to fetch member <@${user.id}>.`) };
    }

    duration = Number(duration);
    if (!Number.isFinite(duration) || duration <= 0) {
        return { success: false, embed: await createErrorEmbed('Error', 'Invalid timeout duration.') };
    }

    const maxTimeoutSeconds = 28 * 24 * 60 * 60;
    if (duration > maxTimeoutSeconds) {
        return { success: false, embed: await createErrorEmbed('Error', 'Timeout duration exceeds the maximum limit of 28 days.') };
    }

    try {
        await member.timeout(duration * 1000, reason || 'No reason provided');
    } catch (err) {
        consoleLog('error', `Failed to timeout member ${user.id} in guild ${guild.id}: ${err}`);
        writeLogToFile(`Failed to timeout member ${user.id} in guild ${guild.id}: ${err}`);
        return { success: false, embed: await createErrorEmbed('Error', `Failed to timeout member <@${user.id}>.`) };
    }

    let embed = new EmbedBuilder()
        .setTitle('User Timed Out')
        .setDescription(`User <@${user.id}> has been timed out for ${formatTime(duration)}.`)
        .addFields(
            { name: 'Reason', value: reason || 'No reason provided' },
            { name: 'Moderator', value: `${moderator.tag} (<@${moderator.id}>)` }
        )
        .setColor(process.env.COLOR_ORANGE)
        .setFooter({ text: process.env.EMBED_FOOTER })
        .setTimestamp();

    return { success: true, embed: embed };
}

async function applyKick(guild, user, reason, moderator) {
    const member = await guild.members.fetch(user.id).catch(err => {
        consoleLog('error', `Failed to fetch member ${user.id} in guild ${guild.id}: ${err}`);
        writeLogToFile(`Failed to fetch member ${user.id} in guild ${guild.id}: ${err}`);
        return null;
    });

    if (!member) {
        return { success: false, embed: await createErrorEmbed('Error', `Failed to fetch member <@${user.id}>.`) };
    }

    try {
        await member.kick(reason || 'No reason provided');
    } catch (err) {
        consoleLog('error', `Failed to kick member ${user.id} in guild ${guild.id}: ${err}`);
        writeLogToFile(`Failed to kick member ${user.id} in guild ${guild.id}: ${err}`);
        return { success: false, embed: await createErrorEmbed('Error', `Failed to kick member <@${user.id}>.`) };
    }

    // Send a message to the mod log channel
    const modLogChannel = await getModLogChannel(guild);
    if (!modLogChannel) {
        return { success: false, embed: await createErrorEmbed('Error', 'Mod log channel not found.') };
    };

    const modlogEmbed = new EmbedBuilder()
        .setTitle('User Kicked')
        .setDescription(`User <@${user.id}> has been kicked.`)
        .addFields(
            { name: 'Reason', value: reason || 'No reason provided' },
            { name: 'Moderator', value: `${moderator.tag} (<@${moderator.id}>)` }
        )
        .setColor(process.env.COLOR_RED)
        .setFooter({ text: process.env.EMBED_FOOTER })
        .setTimestamp();

    await modLogChannel.send({ embeds: [modlogEmbed] });

    let embed = new EmbedBuilder()
        .setTitle('User Kicked')
        .setDescription(`User <@${user.id}> has been kicked.`)
        .addFields(
            { name: 'Reason', value: reason || 'No reason provided' },
            { name: 'Moderator', value: `${moderator.tag} (<@${moderator.id}>)` }
        )
        .setColor(process.env.COLOR_RED)
        .setFooter({ text: process.env.EMBED_FOOTER })
        .setTimestamp();

    return { success: true, embed: embed };
}

async function applyBan(guild, user, reason, moderator) {
    const member = await guild.members.fetch(user.id).catch(err => {
        consoleLog('error', `Failed to fetch member ${user.id} in guild ${guild.id}: ${err}`);
        writeLogToFile(`Failed to fetch member ${user.id} in guild ${guild.id}: ${err}`);
        return null;
    });

    if (!member) {
        return { success: false, embed: await createErrorEmbed('Error', `Failed to fetch member <@${user.id}>.`) };
    }

    try {
        await member.ban({ reason: reason || 'No reason provided' });
    } catch (err) {
        consoleLog('error', `Failed to ban member ${user.id} in guild ${guild.id}: ${err}`);
        writeLogToFile(`Failed to ban member ${user.id} in guild ${guild.id}: ${err}`);
        return { success: false, embed: await createErrorEmbed('Error', `Failed to ban member <@${user.id}>.`) };
    }

    let embed = new EmbedBuilder()
        .setTitle('User Banned')
        .setDescription(`User <@${user.id}> has been banned.`)
        .addFields(
            { name: 'Reason', value: reason || 'No reason provided' },
            { name: 'Moderator', value: `${moderator.tag} (<@${moderator.id}>)` }
        )
        .setColor(process.env.COLOR_DARK_RED)
        .setFooter({ text: process.env.EMBED_FOOTER })
        .setTimestamp();

    return { success: true, embed: embed };
}

async function applyPermBan(guild, user, reason, moderator) {
    const member = await guild.members.fetch(user.id).catch(err => {
        consoleLog('error', `Failed to fetch member ${user.id} in guild ${guild.id}: ${err}`);
        writeLogToFile(`Failed to fetch member ${user.id} in guild ${guild.id}: ${err}`);
        return null;
    });

    if (!member) {
        return { success: false, embed: await createErrorEmbed('Error', `Failed to fetch member <@${user.id}>.`) };
    }

    try {
        await member.ban({ reason: reason || 'No reason provided' });
    } catch (err) {
        consoleLog('error', `Failed to permanently ban member ${user.id} in guild ${guild.id}: ${err}`);
        writeLogToFile(`Failed to permanently ban member ${user.id} in guild ${guild.id}: ${err}`);
        return { success: false, embed: await createErrorEmbed('Error', `Failed to permanently ban member <@${user.id}>.`) };
    }

    let embed = new EmbedBuilder()
        .setTitle('User Permanently Banned')
        .setDescription(`User <@${user.id}> has been permanently banned.`)
        .addFields(
            { name: 'Reason', value: reason || 'No reason provided' },
            { name: 'Moderator', value: `${moderator.tag} (<@${moderator.id}>)` }
        )
        .setColor(process.env.COLOR_DARK_RED)
        .setFooter({ text: process.env.EMBED_FOOTER })
        .setTimestamp();

    return { success: true, embed: embed };
}

module.exports = {
    getWarns,
    getWarnsByUserId,
    addWarn,
    revertWarn,
    applyTimeout,
    applyKick,
    applyBan,
    applyPermBan,
};