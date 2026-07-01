function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function parseDurationToSeconds(input) {
    if (!input) return 0;

    const value = input.trim().toLowerCase();

    if (/^\d+$/.test(value)) {
        return Number(value); // raw seconds
    }

    const match = value.match(/^(\d+)\s*(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days)$/);

    if (!match) return null;

    const amount = Number(match[1]);
    const unit = match[2];

    const multipliers = {
        s: 1,
        sec: 1,
        secs: 1,
        second: 1,
        seconds: 1,
        m: 60,
        min: 60,
        mins: 60,
        minute: 60,
        minutes: 60,
        h: 3600,
        hr: 3600,
        hrs: 3600,
        hour: 3600,
        hours: 3600,
        d: 86400,
        day: 86400,
        days: 86400,
    };

    return amount * multipliers[unit];
}

module.exports = {
    formatTime,
    parseDurationToSeconds
};