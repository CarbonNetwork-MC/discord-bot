const fs = require('fs');
const path = require('path');

const logFileDir = path.join(__dirname, '..', 'logs');
const logFilePath = path.join(logFileDir, 'app.log');

function consoleLog(type, message) {
    const types = ['system', 'info', 'warning', 'error'];
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    let consoleLine = `\x1b[1;30m[${timestamp}]\x1b[0m `; 

    if (!types.includes(type)) {
        const error = new Error().stack.split('\n')[2].trim();
        const match = error.match(/\((.*?:\d+:\d+)\)/);
        const location = match ? match[1] : 'unknown location';

        consoleLine += `\x1b[31m[ERROR]\x1b[0m at (${location}). Incorrect log type: "${type}". Allowed types are: ${types.join(', ')}.`;
    } else {
        const typeColors = {
            system: '\x1b[1;34m',  // Cyan
            info: '\x1b[32m',    // Green
            warning: '\x1b[33m', // Yellow
            error: '\x1b[31m'    // Red
        };

        const color = typeColors[type] || '\x1b[0m';
        const typeName = type.toUpperCase();

        consoleLine += `${color}[${typeName}]\x1b[0m ${message}`; // Add color and reset after
    }

    console.log(consoleLine);
}

function ensureLogFileExists() {
    if (!fs.existsSync(logFileDir)) {
        fs.mkdirSync(logFileDir, { recursive: true });
    }

    if (!fs.existsSync(logFilePath)) {
        fs.writeFileSync(logFilePath, '');
    }
}

function writeLogToFile(type, message) {
    ensureLogFileExists();

    const types = ['system', 'info', 'warning', 'error'];
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (!types.includes(type)) {
        const error = new Error().stack.split('\n')[2].trim();
        const match = error.match(/\((.*?:\d+:\d+)\)/);
        const location = match ? match[1] : 'unknown location';

        const errorMessage = `Incorrect log type: "${type}". Allowed types are: ${types.join(', ')}.`;
        
        const logLine = `[${timestamp}] [ERROR] at (${location}). ${errorMessage}\n`;
        fs.appendFileSync(`${logFilePath}`, logLine);
        return;
    }

    const logLine = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(`${logFilePath}`, logLine);
}

module.exports = {
    consoleLog,
    writeLogToFile
};