import * as WebSocket from 'ws';
import { IncomingMessage } from 'http';
import * as uuid from 'uuid';
import { verify } from 'jsonwebtoken';
import { SECRET } from '../../.env';

export interface Method {
    type: string,
    action?: (ws?: WebSocket, req?: IncomingMessage, data?: any) => void;
    use?: string[]
}

export interface MethodRequest {
    type: string;
    data: any;
}

export type Middleware = (connection, req, data, next) => void;


interface CustomSocket extends WebSocket {
    id: string;
}
export default class SocketApp {

    server: WebSocket.Server;
    methods: Method[] = [];
    middlewares: Middleware[] = [];
    users: {
        [id: string]: {
            socket: WebSocket,
            lastAction: Date
        }[]
    }

    private handleData = (connection: CustomSocket, req: IncomingMessage, data: string) => {
        try {
            console.log(connection.id);
            const parsedData: MethodRequest = JSON.parse(data);
            const { type, data: payload } = parsedData;
            if(payload.id) {
                
            }
            let currentMiddlewareIndex = -1;
            let toCall: Method;
            for (let method of this.methods) {
                if (method.type === type) {
                    toCall = method;
                    break;
                }
            }
            if(!toCall) {
                return;
            }
            const next = () => {
                currentMiddlewareIndex++;
                if(currentMiddlewareIndex === this.middlewares.length) {
                    toCall.action(connection, req, payload);
                    return;
                }
                let currentMiddleware = this.middlewares[currentMiddlewareIndex];
                if(toCall.use) {
                    if(toCall.use.indexOf(currentMiddleware.name) !== -1) {
                        currentMiddleware(connection, req, payload, next);
                    }
                } else {
                    next();
                }
            }
           next();
        } catch (error) {
            console.log(error);
        }
    }

    constructor(options: WebSocket.ServerOptions) {
        this.server = new WebSocket.Server(options);
        this.server.on('connection', (ws: CustomSocket, request) => {
            ws.id = uuid()
            ws.on("message", (data) => {
                this.handleData(ws, request, data.toString());
            });
        });
    }

    //registers socket to a specific user to be brocasted in the future
    registerSocket(id: string, socket: WebSocket) {
        this.users[id] = this.users[id] ? [... this.users[id], { socket, lastAction: new Date()}] : [{ socket, lastAction: new Date()}];
    }

    addMethod(type: string, action: (ws?: WebSocket, req?: IncomingMessage, data?: any) => void, use?: string[]) {
        this.methods.push({
            type,
            action,
            use
        })
    }

    addMidleware(middleware: Middleware) {
        this.middlewares.push(middleware)
    }

    getServer() {
        return this.server;
    }

}
