const Queue = require('../services/queue.js');

module.exports = {
    roleQueue: new Queue({ delay: 750 }),
}