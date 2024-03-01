const { promisify } = require('util');
const sleep = promisify(setTimeout);

const jobProcessor = async (job) => {
    await job.log(`Started processing job with id ${job.id}`);
    await sleep(5000);
    
    //console.debug(job?.data);

    // send email verification
    //await this.verifyEmail(

    //);

    await job.updateProgress(100);
    return 'DONE';
};

module.exports = jobProcessor;

// send email verification
exports.verifyEmail = async function(url='', token, uid) {
    try {
        let _url = url + "/" + uid + "/execute-actions-email";
        const _response = await fetch(_url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => res.status)
        .then(data => { return data }) // return data to out from fetch
        .catch(error => console.log(error));
        return _response;
    } catch (err) {
        console.log('Error', err);
    }
}