const { REST, Routes } = require('discord.js');
const path = require('node:path');

require('dotenv').config({
    path: path.resolve(__dirname, '../../.env'),
});

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Clearing global application commands...');

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] }
        );

        console.log(`Successfully cleared ${data.length} global commands.`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();