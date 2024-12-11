// config.js
import path from 'path';

const appDir = path.join(__dirname, '../');

export const config = {
    http: {
        port: 3000
    },
    https: {
        port: 3443
    },
    cors: {
        origin: ['http://localhost:4173','http://localhost:5173','https://localhost:3443'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: ['Content-Type', 'Authorization']
    },
    paths: {
        appDir: appDir,
        certsDir: path.join(appDir, 'certs'),
        resDir:path.join(appDir, 'res')

    }
};


