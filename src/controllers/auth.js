'use strict';

import BrokerMessage from "../lib/bullmq.js";
import Keycloak from "../lib/keycloak.js";
import { isEmpty } from "../utils/utils.js";
import { sendEmailRegistration } from "../utils/processors.js";


export function login(data) {
    return new Promise (async (resolve, reject) => {
        try {
            const _keycloak = new Keycloak();

            const _result = await _keycloak.login(data);
            
            return resolve(_result);
        } catch (err) {
            return reject(err);
        }
    })
}

export function register(data) {
    return new Promise (async (resolve, reject) => {
        try {
            const _keycloak = new Keycloak();

            const _result = await _keycloak.registration(data);

            // send email verification
            if (! await isEmpty(_result)) {
                // get keycloak user uuid
                const _uuid = _result.data.split("/").pop();
                // create broker
                const _broker = new BrokerMessage();
                await _broker.createBroker('sendEmail', {
                    name: 'verifyEmail',
                    payload: {
                        _uuid
                    }
                }, sendEmailRegistration);
            }

            return resolve(_result);
        } catch (err) {
            return reject(err);
        }
    })
}