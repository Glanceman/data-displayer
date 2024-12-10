import fs from 'fs';
import path from 'path';
import { config } from '../config/config.js';

export class FileService {
    static async saveJson(fileName, content) {
        const filePath = path.join(config.paths.resDir, `${fileName}.json`);
        return fs.promises.writeFile(filePath, JSON.stringify(content, null, 2));
    }

    static async saveXml(fileName, content) {
        const filePath = path.join(config.paths.resDir, `${fileName}.xml`);
        return fs.promises.writeFile(filePath, content);
    }
}
