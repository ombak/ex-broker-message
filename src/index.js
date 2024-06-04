import { config } from 'dotenv';
import express, { json } from 'express';
import routesApps from './routes/index.js';

const apps = express();
const PORT = 3002;

config();
apps.use(json());

// root
apps.get('/', async (req, res) => {
    return res.json({
        technologies: 'NodeJS Express, BullMQ, Redis and Keycloak',
        developer: 'ombak',
        message: '^o^'
    });
});

apps.use('/', routesApps);

apps.listen(PORT, async function onListen() {
    console.log(`Server is up and running on port ${PORT}`);
});