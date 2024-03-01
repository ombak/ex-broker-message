const { promisify } = require('util');
const sleep = promisify(setTimeout);

const jobProcessor = async (job) => {
    await job.log(`Started processing job with id ${job.id}`);
    
    await sleep(5000);
    
    console.debug(job?.data);
    // registration 

    await job.updateProgress(100);
    return 'DONE';
};

module.exports = jobProcessor;