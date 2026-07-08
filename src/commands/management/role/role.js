const {
    SlashCommandBuilder,
    MessageFlags,
    InteractionContextType,
    ApplicationIntegrationType,
} = require('discord.js');

const { consoleLog, writeLogToFile } = require('../../../services/logger.js');
const list = require('./subcommands/list.js');
const info = require('./subcommands/info.js');
const create = require('./subcommands/create.js');
const deleteRole = require('./subcommands/delete.js');
const color = require('./subcommands/color.js');

const add = require('./subcommands/add.js');
const all = require('./subcommands/all.js');
const bots = require('./subcommands/bots.js');
const humans = require('./subcommands/humans.js');
const inRole = require('./subcommands/in.js');

const rall = require('./subcommands/rall.js');
const remove = require('./subcommands/remove.js');
const removeAll = require('./subcommands/removeall.js');
const removeBots = require('./subcommands/removebots.js');
const removeHumans = require('./subcommands/removehumans.js');
const removeInRole = require('./subcommands/removein.js');

const diagnose = require('./subcommands/diagnose.js');

const subcommands = new Map([
    ['list', list],
    ['info', info],
    ['create', create],
    ['delete', deleteRole],
    ['color', color],

    ['add', add],
    ['all', all],
    ['bots', bots],
    ['humans', humans],
    ['in', inRole],

    ['rall', rall],
    ['remove', remove],
    ['removeall', removeAll],
    ['removebots', removeBots],
    ['removehumans', removeHumans],
    ['removein', removeInRole],

    ['diagnose', diagnose],
])

module.exports = {
    isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: [
        'ManageRoles',
    ],

    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Manage roles in the server.')
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		])
        .addSubcommand(list.data)
        .addSubcommand(info.data)
        .addSubcommand(create.data)
        .addSubcommand(deleteRole.data)
        .addSubcommand(color.data)

        .addSubcommand(add.data)
        .addSubcommand(all.data)
        .addSubcommand(bots.data)
        .addSubcommand(humans.data)
        .addSubcommand(inRole.data)

        .addSubcommand(rall.data)
        .addSubcommand(remove.data)
        .addSubcommand(removeAll.data)
        .addSubcommand(removeBots.data)
        .addSubcommand(removeHumans.data)
        .addSubcommand(removeInRole.data)

        .addSubcommand(diagnose.data),

    async execute(interaction) {
        const name = interaction.options.getSubcommand();
        const subcommand = subcommands.get(name);

        if (!subcommand) {
            return interaction.reply({
                content: 'Unknown subcommand.',
                flags: MessageFlags.Ephemeral,
            });
        }

        return subcommand.execute(interaction);
    }
}
