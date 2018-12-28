import * as WebSocket from 'ws';
import { IncomingMessage } from 'http';


interface Method {
    type: string,
    cb?: (ws?: WebSocket, req?: IncomingMessage, data?: any) => void;
}

interface MethodRequest {
    type: string;
    data: any;
}

export type Middleware = (connection, req, data, next) => void;

export default class SocketApp {

    server: WebSocket.Server;
    methods: Method[] = [];
    midlewares: Middleware[]
    
    private handleData = (connection: WebSocket, req: IncomingMessage, data: string) => {
        try {
            const parsedData: MethodRequest = JSON.parse(data);
            for (let method of this.methods) {
                if (method.type === parsedData.type) {
                    method.cb(connection, req, parsedData.data);
                }
            }
        } catch (error) {

        }
    }

    constructor(options: WebSocket.ServerOptions) {
        this.server = new WebSocket.Server(options);
        this.server.on('connection', (ws, request) => {
            ws.on("message", (data) => {
                console.log(data);
                this.handleData(ws, request, data.toString());
            });
        });
    }

    addMethod(type: string, cb: (ws?: WebSocket, req?: IncomingMessage, data?: any) => void) {
        this.methods.push({
            type,
            cb
        })
    }

    addMidleware() {

    }

    getServer() {
        return this.server;
    }

}
