'use strict';

import { promisify } from 'util';
import Keycloak from "../lib/keycloak.js";

// make sleep process
const sleep = promisify(setTimeout);

/**
 * Create function to handle worker from message broker
 * send email registration
 * @param object job {
 *      string name,
 *      object payload {
 *          uuid uuid
 *      }
 * }
 * @returns string
 */
export async function sendEmailRegistration(job) {
    try {
        await job.log(`Started processing job with id ${job.id}`);
        await sleep(2500);

        const _keycloak = new Keycloak();
        const _result = await _keycloak.verifyEmail(job.data);

        await job.updateProgress(100);
        return 'DONE';
    } catch (error) {
        console.error(`Job ${job.id} failed with error ${error.message}`);
        return 'ERROR';
    }
}