'use strict';

import express from 'express';
const _router = express.Router();

import auth from './auth.js';


// auth
_router.use('/auth', auth);

export default _router;