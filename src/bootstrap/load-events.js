const fs = require('fs');
const path = require('path');

const { consoleLog, writeLogToFile } = require('../services/logger.js');

function getFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    return entries.flatMap(entry => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            return getFiles(fullPath);
        }

        return entry.name.endsWith('.js') ? [fullPath] : [];
    });
}

function loadEvents(client) {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = getFiles(eventsPath);

    if (client.loggingSettings.cache.size === 0) {
        consoleLog('warning', 'Logging settings cache is empty. Events may not function correctly.');
        writeLogToFile('warning', 'Logging settings cache is empty. Events may not function correctly.');
    }

    let loadedEventCount = 0;

    for (const filePath of eventFiles) {
        const event = require(filePath);

        if (!event.name || !event.execute) {
            consoleLog('warning', `The event at ${filePath} is missing a required "name" or "execute" property.`);
            writeLogToFile('warning', `The event at ${filePath} is missing a required "name" or "execute" property.`);
            continue;
        }

        const runEvent = async (...args) => {
            try {
                await event.execute(...args);
            } catch (err) {
                consoleLog('error', `Error in event ${event.name}: ${err}`);
                writeLogToFile('error', `Error in event ${event.name}: ${err}`);
            }
        };

        if (event.once) {
            client.once(event.name, runEvent);
        } else {
            client.on(event.name, runEvent);
        }

        // # Debugging: Log the loaded event handler
        // consoleLog('system', `Loaded event handler: ${event.name} from ${filePath}`);
        loadedEventCount++;
    }

    consoleLog('system', `Successfully loaded ${loadedEventCount} event handlers.`);
}

module.exports = { loadEvents };