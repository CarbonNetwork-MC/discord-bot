const mysql = require('mysql2/promise');
const { consoleLog, writeLogToFile } = require('./logger.js');

let pool;

async function initDbPool(retries = 3, delay = 2000) {
    pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const conn = await pool.getConnection();
            conn.release();
            consoleLog('system', `Database pool initialized successfully (attempt ${attempt}).`);
            return pool;
        } catch (err) {
            consoleLog('error', `DB connection failed on attempt ${attempt}: ${err.code || 'UNKNOWN'} - ${err.message || err}`);
            writeLogToFile('error', `DB connection failed on attempt ${attempt}: ${err.code || 'UNKNOWN'} - ${err.message || err}`);
            if (attempt < retries) await new Promise(res => setTimeout(res, delay));
        }
    }

    consoleLog('error', `All ${retries} connection attempts failed. Continuing without DB.`);
    writeLogToFile('error', `All ${retries} connection attempts failed. Continuing without DB.`);
    return null;
}

function getDbPool() {
    if (!pool) throw new Error('DB pool not initialized. Call initDbPool() first.');
    return pool;
}

module.exports = { initDbPool, getDbPool };