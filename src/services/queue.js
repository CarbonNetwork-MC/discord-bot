const { consoleLog } = require('./logger.js');

class Queue {
    constructor({ delay = 0 } = {}) {
        this.queue = [];
        this.running = false;
        this.delay = delay;
    }

    add(job) {
        if (typeof job !== 'function') {
            throw new TypeError('Queue job must be a function');
        }

        this.queue.push(job);
        this.run();
    }

    async run() {
        if (this.running) return;

        this.running = true;

        while (this.queue.length > 0) {
            const job = this.queue.shift();

            try {
                await job();
            } catch (error) {
                consoleLog('error', `Queue job failed: ${error.stack || error}`);
            }

            if (this.delay > 0) {
                await this.wait(this.delay);
            }
        }

        this.running = false;
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = Queue;