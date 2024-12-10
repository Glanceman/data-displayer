import jks from 'jks-js';
import fs from 'fs'
import path from 'path'
import {config} from '../config/config.js'

export class CertificateService {
    static async loadCertificatesJKS() {
        const keystore = jks.toPem(
            fs.readFileSync(path.join(config.paths.certsDir, 'server.jks')),
            'password'
        );
        const { key, cert } = keystore['testingkey2'];
        
        await Promise.all([
            fs.promises.writeFile(path.join(config.paths.certsDir, 'key.pem'), key),
            fs.promises.writeFile(path.join(config.paths.certsDir, 'cert.pem'), cert)
        ]);
        console.log("Save key and cert ")

        return { key, cert };
    }

    static async loadCertificatesX509() {
        try {
            let results = await Promise.all([
                fs.promises.readFile(path.join(config.paths.certsDir, 'key.pem'),{ encoding: 'utf8' }),
                fs.promises.readFile(path.join(config.paths.certsDir, 'cert.pem'),{ encoding: 'utf8' })
            ]);
            let key = results[0];
            let cert = results[1];
            return { key, cert };
        } catch (error) {
            console.error('Error loading certificates:', error);
            throw error; // Re-throw or handle appropriately
        }
    }
}