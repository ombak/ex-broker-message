'use strict';


export default class Keycloak {
    // constructor
    constructor() {
        // apps
        this.urlRegistration = process.env.KEYCLOAK_USER_REG;
        this.urlLogin = process.env.KEYCLOAK_USER_LOGIN;
        this.clientId = process.env.KEYCLOAK_USER_CLIENT_ID;
        this.clientSecret = process.env.KEYCLOAK_USER_CLIENT_SECRET;
        this.grantTypeCredentials = "client_credentials";
        this.grantTypePassword = "password";
    }

    // get token for
    async #getKeycloakToken() {
        try {
            const _response = await fetch(this.urlLogin, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    grant_type: this.grantTypeCredentials,
                    client_id: this.clientId,
                    client_secret: this.clientSecret
                }).toString()
            });

            return await _response.json();
        } catch (err) {
            console.error(err);
        }
    }

    // login
    async login(data) {
        try {
            //...fetch to get token form keycloak
            const _response = await fetch(this.urlLogin, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: this.grantTypePassword,
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    username: data.username,
                    password: data.password
                }).toString()
            });

            return {
                status: _response.status,
                statusText: _response.statusText,
                data: await _response.json()
            }
        } catch (err) {
            console.error(err);
        }
    }

    // registration
    async registration(payload) {
        try {
            const _token = await this.#getKeycloakToken();
            let _namaLengkap = payload.nama.split(' ');
            let _namaDepan = _namaLengkap.shift(); // get first name
            let _namaBelakang = _namaLengkap.join(' ').trim();

            const _response = await fetch(this.urlRegistration, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${_token.access_token}`
                },
                body: JSON.stringify({
                    firstName: _namaDepan,
                    lastName: _namaBelakang,
                    email: payload.email,
                    username: payload.username,
                    credentials: [{
                        type: "password",
                        value: payload.password
                    }],
                    "enabled": true
                })
            });

            return {
                status: _response.status,
                statusText: _response.statusText,
                data: _response.headers.get('location')
            }
        } catch (err) {
            console.error(err)
        }
    }

    // verify email
    async verifyEmail(data) {
        try {
            const { _uuid } = data;
            const _token = await this.#getKeycloakToken();
            const _url = this.urlRegistration + "/" + _uuid + "/execute-actions-email";
            
            const _response = await fetch(_url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${_token.access_token}`
                }
            });

            return _response.status;
        } catch (err) {
            console.error(err);
        }
    }

    // reset password
    async resetPasswordEmail(data) {
        try {
            const { _memberUuid } = data;
            const _token = await this.#getKeycloakToken();
            const _url = this.urlRegistration + "/" + _memberUuid + "/" + "reset-password-email";

            const _response = await fetch(_url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${_token.access_token}`
                }
            });
            
            return _response.status;
        } catch (err) {
            console.error(err);
        }
    }
}