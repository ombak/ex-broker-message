const DotEnv = require('dotenv');
DotEnv.config();

const express = require('express');
const path = require('path');
const addJobToQueue = require('./bullmq/queue');

const app = express();
const PORT = 3002;

app.use(express.json());

// root
app.get('/', async (req, res) => {
    return res.json({
        technologies: 'NodeJS Express, BullMQ, Redis and Keycloak',
        developer: 'ombak',
        message: ''
    });
})

// send email verification
app.post('/send-email', async (req, res) => { 
    const _body = req.body;
    const _kcUrlReg = process.env.KEYCLOAK_MEMBER_REG;
    const _kcUrlLogin = process.env.KEYCLOAK_MEMBER_LOGIN;
    const _kcClientId = process.env.KEYCLOAK_MEMBER_CLIENT_ID;
    const _kcClientSecret = process.env.KEYCLOAK_MEMBER_CLIENT_SECRET;
    const _kcGrantType = "client_credentials";

    // register user to keycloak
    // and get token
    const _token = await this.getKeycloakToken(_kcUrlLogin, {
        grant_type: _kcGrantType,
        client_id: _kcClientId,
        client_secret: _kcClientSecret
    });

    // register the member to keycloak
    const _registerMember = await this.registerUsers(
        _kcUrlReg,
        _token.access_token,
        {
            "firstName": _body.firstName,
            "lastName": _body.lastName,
            "email": _body.email,
            "username": _body.username,
            "credentials": [{
                "type": "password",
                "value": _body.password
            }],
            "enabled": true
        }
    );

    // if success
    if (_registerMember) {
        // get token from keycloak
        const _uuid = _registerMember.split("/").pop();
        await this.verifyEmail(
            _kcUrlReg,
            _token.access_token,
            _uuid
        )
    }

    const _data = { _jobName: 'sendEmail', _body };
    const _job = await addJobToQueue(_data);

    return res.status(201).json({ jobId: _job.id });
});

app.listen(PORT, async function onListen() {
    console.log(`Server is up and running on port ${PORT}`);
});


// get keycloak token with credentials
exports.getKeycloakToken = async function(url, data={}) {
    try {
        const _response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(data).toString()
        })
        .then(response => response.json())
        .then(data => { return data }) // return data to out from fetch
        .catch(error => console.log(error));
        return _response;
    } catch (err) {
        console.log("Error:", err);
    }
}

// register users
exports.registerUsers = async function(url='', token, data={}) {
    try {
        const _response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        })
        .then(res => res.headers.get('Location'))
        .then(data => { return data }) // return data to out from fetch
        .catch(error => console.log(error));
        return _response;
    } catch (err) {
        console.log('Error', err)
    }
}

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