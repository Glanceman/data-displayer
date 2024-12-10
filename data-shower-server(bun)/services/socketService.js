// services/socketService.js
import { Server } from 'socket.io';
import { config } from '../config/config.js';

export class SocketService {
    constructor() {
        this.clientSocket = null;
    }

    initialize(server) {
        const options = {
            cors: {
                'origin':config.cors.origin,
                'methods':config.cors.methods,
                'allowedHeaders':config.cors.allowedHeaders
            }
        }
        console.log(options)
        const io = new Server(server,options);
        io.on('connection', (socket) => {
            console.log('Client connected');
            this.clientSocket = socket;
        });
    }

    emit(data) {
        if (this.clientSocket) {
            this.clientSocket.emit('data', {
                timestamp: Date.now(),
                ...data
            });
        }
    }
}