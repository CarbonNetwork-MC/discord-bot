const mysql = require('mysql2/promise');
const { consoleLog } = require('./logger.js');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testConnectionWithRetry(retries = 3, delay = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const connection = await pool.getConnection();
            consoleLog('system', `Database pool initialized successfully (attempt ${attempt}).`);
            connection.release();
            return;
        } catch (err) {
            consoleLog('error', `Database connection failed on attempt ${attempt}: ${err.code || 'UNKNOWN'} - ${err.message || err}`);
            if (attempt < retries) {
                await new Promise(res => setTimeout(res, delay));
            } else {
                consoleLog('error', `All ${retries} connection attempts failed. Continuing without DB.`);
            }
        }
    }
}

testConnectionWithRetry();

module.exports = pool;