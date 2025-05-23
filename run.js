const { main } = require('./index');
const Scheduler = require('./src/scheduler');

// Initialize and start the scheduler
const scheduler = new Scheduler(main);
scheduler.start(); 