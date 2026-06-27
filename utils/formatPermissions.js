const { PermissionsBitField } = require('discord.js');

const PERMISSION_LABELS = require('../src/enums/PermissionLabels.js');

function formatPermissions(permissionsArray) {
    return permissionsArray
        .map(p => PERMISSION_LABELS[p] || p)
        .join(', ');
}

function getPerms(bitfield) {
    return formatPermissions(new PermissionsBitField(bitfield).toArray());
}

module.exports = { formatPermissions, getPerms };