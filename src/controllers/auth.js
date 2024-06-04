'use strict';

import keycloak from "../lib/keycloak.js";


export function login(data) {
    return new Promise (async (resolve, reject) => {
        try {
            const _keycloak = new keycloak();

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
            const _keycloak = new keycloak();

            const _result = await _keycloak.registration(data);

            return resolve(_result);
        } catch (err) {
            return reject(err);
        }
    })
}