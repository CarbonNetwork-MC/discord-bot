const { Client, Collection, GatewayIntentBits } = require('discord.js');
const path = require('path');

const { bootstrap } = require('./bootstrap/bootstrap.js');

require('dotenv').config({
    path: path.resolve(__dirname, '../.env'),
});

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildModeration,
    ],
});

client.commands = new Collection();

bootstrap(client).catch(error => {
    console.error('Error during bot bootstrap:', error);
    process.exit(1);
})

process.on('unhandledRejection', error => {
    console.error('Unhandled Rejection:', error);

    if (error?.code === 50013) {
        console.log('Missing Permissions');
    }
});