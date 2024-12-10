// routes/index.js
import express from 'express';
import { FileService } from '../services/fileService.js';
import { xmlParserMiddleware } from "../middleware/xmlParserMiddleware.js";
import { config } from '../config/config.js';
import path from "path"
import { XMLBuilder } from 'fast-xml-parser';

export function setupRoutes(app, socketService) {
    app.get('/', async (req, res) => {
        console.log(path.join(config.paths.appDir, 'dist', 'index.html'))
        res.sendFile(path.join(config.paths.appDir, 'dist', 'index.html'));
    });

    app.post('/save-json/:api_name', async (req, res) => {
        try {
            const fileName = req.params.api_name || `file${Date.now()}`;
            console.log("save-json", fileName, req.body);

            socketService.emit({
                content_type: 'json',
                content: JSON.stringify(req.body, null, 2)
            });

            await FileService.saveJson(fileName, req.body);
            res.status(200).send(`Request body saved to ${fileName}.json`);
        } catch (error) {
            console.error('Error processing request:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.post('/save-xml/:api_name', xmlParserMiddleware(), async (req, res) => {
        try {
            const fileName = req.params.api_name || `file${Date.now()}`;
            console.log("save-xml", fileName, req.body);

            const builder = new XMLBuilder({
                attributeNamePrefix: "@_",
                processEntities: false,
                format: true,
                ignoreAttributes: false,
            });
            const xmlContent = builder.build(req.body);

            socketService.emit({
                content_type: 'xml',
                content: xmlContent
            });

            await FileService.saveXml(fileName, xmlContent);
            res.status(200).send(`Request body saved to ${fileName}.xml`);
        } catch (error) {
            console.error('Error processing request:', error);
            res.status(500).send('Internal Server Error');
        }
    });
}