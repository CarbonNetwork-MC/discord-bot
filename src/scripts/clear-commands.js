const { REST, Routes, Collection } = require('discord.js');
const path = require('node:path');

require('dotenv').config({
    path: path.resolve(__dirname, '../../.env'),
});

const { loadCommands } = require('../bootstrap/load-commands.js');
const { getCommandTargets } = require('../utils/get-command-targets.js');

const args = process.argv.slice(2);

const shouldClearGlobal = args.includes('--global') || args.includes('--all');
const shouldClearDev = args.includes('--dev') || args.includes('--all');
const shouldClearServerSpecific = args.includes('--server-specific') || args.includes('--all');
const shouldClearGuild = args.some(arg => arg.startsWith('--guild='));

const guildIds = args
    .filter(arg => arg.startsWith('--guild='))
    .map(arg => arg.split('=')[1]);

const rest = new REST().setToken(process.env.TOKEN);

async function clearGlobalCommands() {
    console.log('Clearing global application commands...');

    const currentCommands = await rest.get(
        Routes.applicationCommands(process.env.CLIENT_ID)
    );

    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: [] }
    );

    console.log(`Cleared ${currentCommands.length} global commands.`);
}

async function clearGuildCommands(guildId) {
    console.log(`Clearing guild commands for ${guildId}...`);

    const currentCommands = await rest.get(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId)
    );

    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
        { body: [] }
    );

    console.log(`Cleared ${currentCommands.length} commands from guild ${guildId}.`);
}

function getTargetGuildIds() {
    const fakeClient = {
        commands: new Collection(),
    };

    const commands = loadCommands(fakeClient, false);
    const { commandsByGuild } = getCommandTargets(commands);

    return [...commandsByGuild.keys()];
}

(async () => {
    try {
        if (!shouldClearGlobal && !shouldClearDev && !shouldClearServerSpecific && !shouldClearGuild) {
            console.log('No clear mode provided. Use --global, --dev, --server-specific, --guild, or --all.');
            process.exit(0);
        }

        const clearedGuilds = new Set();

        if (shouldClearGlobal) {
            await clearGlobalCommands();
        }

        if (shouldClearDev) {
            await clearGuildCommands(process.env.DEV_GUILD_ID);
            clearedGuilds.add(process.env.DEV_GUILD_ID);
        }

        if (shouldClearServerSpecific) {
            const guildIds = getTargetGuildIds();

            console.log(`Found ${guildIds.length} guilds in command targets.`);

            for (const guildId of guildIds) {
                if (clearedGuilds.has(guildId)) continue;

                await clearGuildCommands(guildId);
                clearedGuilds.add(guildId);
            }
        }

        if (shouldClearGuild) {
            for (const guildId of guildIds) {
                if (clearedGuilds.has(guildId)) continue;

                await clearGuildCommands(guildId);
                clearedGuilds.add(guildId);
            }
        }

        console.log('Done clearing commands.');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();