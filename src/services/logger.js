const fs = require('fs');
const path = require('path');

const logFileDir = path.join(__dirname, '..', 'logs');

const LOGGING = process.env.LOGGING || 'single';

const validTypes = ['system', 'info', 'warning', 'error'];
const validLoggingModes = [
    'single',
    'timebased',
    'extended',
    'timebased-extended'
];

const botStartTimestamp = new Date()
    .toISOString()
    .replace(/:/g, '-')
    .replace('T', '_')
    .slice(0, 19);

function getTimestamp() {
    return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function getCallerLocation() {
    const error = new Error().stack.split('\n')[3]?.trim() || '';
    const match = error.match(/\((.*?:\d+:\d+)\)/);
    return match ? match[1] : 'unknown location';
}

function getLogFilePath(type) {
    switch (LOGGING) {
        case 'single':
            return path.join(logFileDir, 'app.log');

        case 'timebased':
            return path.join(logFileDir, `${botStartTimestamp}.log`);

        case 'extended':
            return path.join(logFileDir, `${type}.log`);

        case 'timebased-extended':
            return path.join(logFileDir, botStartTimestamp, `${type}.log`);

        default:
            return path.join(logFileDir, 'app.log');
    }
}

function ensureLogFileExists(filePath) {
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '');
    }
}

function consoleLog(type, message) {
    const timestamp = getTimestamp();
    let consoleLine = `\x1b[1;30m[${timestamp}]\x1b[0m `;

    if (!validTypes.includes(type)) {
        const location = getCallerLocation();

        consoleLine += `\x1b[31m[ERROR]\x1b[0m at (${location}). Incorrect log type: "${type}". Allowed types are: ${validTypes.join(', ')}.`;
    } else {
        const typeColors = {
            system: '\x1b[1;34m',
            info: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m'
        };

        consoleLine += `${typeColors[type]}[${type.toUpperCase()}]\x1b[0m ${message}`;
    }

    console.log(consoleLine);
}

function writeLogToFile(type, message) {
    const timestamp = getTimestamp();

    let logType = type;
    let logMessage = message;

    if (!validLoggingModes.includes(LOGGING)) {
        logType = 'error';
        logMessage = `Incorrect LOGGING mode: "${LOGGING}". Allowed modes are: ${validLoggingModes.join(', ')}.`;
    }

    if (!validTypes.includes(type)) {
        const location = getCallerLocation();

        logType = 'error';
        logMessage = `at (${location}). Incorrect log type: "${type}". Allowed types are: ${validTypes.join(', ')}.`;
    }

    const filePath = getLogFilePath(logType);
    ensureLogFileExists(filePath);

    const logLine = `[${timestamp}] [${logType.toUpperCase()}] ${logMessage}\n`;
    fs.appendFileSync(filePath, logLine);
}

module.exports = {
    consoleLog,
    writeLogToFile
};