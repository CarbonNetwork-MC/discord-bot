const { REST, Routes } = require('discord.js');
const path = require('node:path');

require('dotenv').config({
    path: path.resolve(__dirname, '../../.env'),
});

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Clearing guild application commands...');

        const currentCommands = await rest.get(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.DEV_GUILD_ID
            )
        );

        const data = await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.DEV_GUILD_ID
            ),
            { body: [] }
        );

        console.log(`Successfully cleared ${currentCommands.length} guild commands.`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();