import jks from 'jks-js';
import fs from 'fs'
import path from 'path'
import { config } from '../config/config.js'

export class CertificateService {
    /**
     * Loads certificates from a JKS file and saves them as PEM files.
     *
     * @returns {Promise<{key: string, cert: string}>} An object containing the key and certificate as strings.
     */
    static async loadCertificatesJKS() {
        const jksFile = path.join(config.paths.certsDir, 'server.jks');
        const keystore = jks.toPem(fs.readFileSync(jksFile), 'password');
        const { key, cert } = keystore['testingkey2'];

        await Promise.all([
            fs.promises.writeFile(path.join(config.paths.certsDir, 'key.pem'), key),
            fs.promises.writeFile(path.join(config.paths.certsDir, 'cert.pem'), cert)
        ]);

        console.log('Key and certificate saved successfully.');

        return { key, cert };
    }

    static async loadCertificatesX509() {
        try {
            let [key, cert] = await Promise.all([
                fs.promises.readFile(path.join(config.paths.certsDir, 'key.pem'), { encoding: 'utf8' }),
                fs.promises.readFile(path.join(config.paths.certsDir, 'cert.pem'), { encoding: 'utf8' })
            ]);
            return { key, cert };
        } catch (error) {
            console.error('Error loading certificates:', error);
            throw error; // Re-throw or handle appropriately
        }
    }
}