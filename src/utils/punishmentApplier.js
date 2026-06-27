const { EmbedBuilder } = require('discord.js');
const { getDbPool } = require('../services/database.js');
const { getGuildSettings } = require('../config/guild-settings.js');
const { formatTime } = require('../utils/timeFormatter');

async function getWarns(interaction) {
    const db = getDbPool();
    const guildId = interaction.guild.id;
    const userId = interaction.options.getUser('user').id;
    
    const [rows] = await db.query('SELECT * FROM dcb_warns WHERE guild_id = ? AND user_id = ?', [guildId, userId]);
    return rows;
}

async function addWarn(interaction) {
    const db = getDbPool();
    const guildId = interaction.guild.id;
    const userId = interaction.options.getUser('user').id;
    const reason = interaction.options.getString('reason');
    const moderator = interaction.user;

    await db.query('INSERT INTO dcb_warns (guild_id, user_id, reason, moderator_id) VALUES (?, ?, ?, ?)', [guildId, userId, reason, moderator.id]);

    return true;
}

async function applyMute(interaction) {
    const guildId = interaction.guild.id;
    const userId = interaction.options.getUser('user').id;
    const duration = interaction.options.getInteger('duration');
    const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
    const moderator = interaction.user;

    const settings = await getGuildSettings(guildId);
    const db = getDbPool();

    const embed = new EmbedBuilder()
        .setColor(process.env.COLOR_RED)
        .setFooter({ text: process.env.EMBED_FOOTER })
        .setTimestamp();

    if (!muteRole) {
        embed.setTitle('Mute Role Not Found')
            .setDescription('Please create a role named "Muted" and assign it the necessary permissions.');

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    await interaction.guild.members.cache.get(userId).roles.add(muteRole);

    await db.query('INSERT INTO dcb_mutes (guild_id, user_id, duration, moderator_id) VALUES (?, ?, ?, ?)', [guildId, userId, duration, moderator.id]);
    embed.setTitle('User Muted')
        .setDescription(`User <@${userId}> has been muted for ${formatTime(duration)}`)
        .addFields(
            { name: 'Reason', value: reason || 'No reason provided' },
            { name: 'Duration', value: formatTime(duration) },
            { name: 'Muted until', value: new Date(Date.now() + duration * 1000).toLocaleString() }
        );

    return interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = {
    getWarns,
    addWarn,
};