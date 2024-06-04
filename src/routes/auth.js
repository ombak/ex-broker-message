'use strict';

import express from 'express';
const _router = express.Router();
import { register, login } from '../controllers/auth.js';


// login
_router.post('/login', async (req, res) => {
    const _body = req.body;
    
    const _result = await login(_body);

    res.status(200).json({
        status: 'success',
        data: _result
    });
})

// register
_router.post('/register', async (req, res) => {
    const _body = req.body;

    const _result = await register(_body);

    res.status(_result.status).json({
        status: 'success',
        data: _result.statusText
    });
})

export default _router;