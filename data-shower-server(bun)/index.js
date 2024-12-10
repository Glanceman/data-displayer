import express from 'express';
import http from 'http';
import https from 'https';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { config } from './config/config.js';
import { setupRoutes } from './routes/index.js';
import { SocketService } from './services/socketService.js';
import { CertificateService } from './services/certificateService.js';

async function startServer() {
    const app = express();
    
    // Middleware
    app.use(cors(config.cors));
    app.use(bodyParser.json());
    app.use(bodyParser.text({ type: ["application/xml", "text/xml"] }));
    app.use(express.static(path.join(config.paths.appDir, 'dist')));

    // // Create HTTP server
    const httpServer = http.createServer(app);
    const socketService = new SocketService();
    socketService.initialize(httpServer);

    // // Setup routes
    setupRoutes(app, socketService);

    // // Start HTTP server
    httpServer.listen(config.http.port, () => {
        console.log(`HTTP server listening on port ${config.http.port}`);
    });

    // // Start HTTPS server
    try {
        const certificates = await CertificateService.loadCertificatesX509();
        const httpsServer = https.createServer(certificates, app);
        httpsServer.listen(config.https.port, () => {
            console.log(`HTTPS server listening on port ${config.https.port}`);
        });
    } catch (error) {
        console.error('Failed to start HTTPS server:', error);
    }
}

startServer().catch(console.error);


