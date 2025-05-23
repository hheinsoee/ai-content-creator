const cron = require('node-cron');
const config = require('../config');

class Scheduler {
    constructor(jobFunction) {
        this.jobFunction = jobFunction;
    }

    start() {
        // Schedule the job
        cron.schedule(config.cronSchedule, () => {
            console.log('Running scheduled task...');
            this.jobFunction();
        });

        // Run immediately on startup
        console.log('Running initial task...');
        this.jobFunction();
    }
}

module.exports = Scheduler; 