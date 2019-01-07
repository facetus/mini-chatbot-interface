import * as WebSocket from 'ws';
import { IncomingMessage } from 'http';
import * as uuid from 'uuid';
import { verify } from 'jsonwebtoken';
import { SECRET } from '../../.env';
import { sendAction } from '../utils';

export interface Method {
    type: string,
    action?: (ws?: CustomSocket, req?: IncomingMessage, data?: any) => void;
    use?: string[]
}

export interface MethodRequest {
    type: string;
    data: any;
}

export type Middleware = (connection, req, data, next) => void;


export interface CustomSocket extends WebSocket {
    id: string;
    broadcast: (users: string[], action: any) => void;
}

export default class SocketApp {

    server: WebSocket.Server;
    methods: Method[] = [];
    middlewares: Middleware[] = [];
    users: {
        [id: string]: {
            socket: CustomSocket,
            lastAction: Date
        }[]
    } = {}

    constructor(options: WebSocket.ServerOptions) {
        this.server = new WebSocket.Server(options);
        this.server.on('connection', (ws: CustomSocket, request) => {
            ws.id = uuid();
            ws.broadcast = this.broadcast;
            ws.on("message", (data) => {
                this.handleData(ws, request, data.toString());
            });
        });
    }

    private handleData = (connection: CustomSocket, req: IncomingMessage, data: string) => {
        try {
            const parsedData: MethodRequest = JSON.parse(data);
            const { type, data: payload } = parsedData;
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
                if (payload.id) {
                    this.registerSocket(connection, payload.id);
                }
                currentMiddlewareIndex++;
                if(currentMiddlewareIndex === this.middlewares.length) {
                    toCall.action(connection, req, payload);
                    return;
                }
                let currentMiddleware = this.middlewares[currentMiddlewareIndex];
                if(toCall.use) {
                    if(toCall.use.indexOf(currentMiddleware.name) !== -1) {
                        currentMiddleware(connection, req, payload, next);
                    } else {
                        next();
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

    broadcast = (users: string[], action) => {
        for(let user of users) {
            if(!this.users[user]) {
                continue;
            }
            for(let { socket, lastAction } of this.users[user]) {
                if(socket.readyState === socket.CLOSED) {
                    console.log(socket.CLOSED);
                    console.log('Websocket is closed');
                    continue;
                }
                sendAction(socket, action);
            }
        }
    }

    registerSocket(connection: CustomSocket, userId: string) {
        console.log(`Trying to register socket ${connection.id} to user ${userId}`)
        const sockets = this.users[userId];
        if (sockets) {
            let found = false;
            for (let socketEntry of sockets) {
                if (socketEntry.socket.id === connection.id) {
                    found = true;
                    socketEntry.lastAction = new Date();
                }
            }
            if (!found) {
                sockets.push({
                    socket: connection,
                    lastAction: new Date()
                })
            }
        } else {
            this.users[userId] = [{
                socket: connection,
                lastAction: new Date()
            }];
        }
    }

    clearUnused() {
        Object.keys(this.users).forEach((key) => {
            for(let socketEntry of this.users[key]) {
                
            }
        }); 
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
