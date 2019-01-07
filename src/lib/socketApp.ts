import { IncomingMessage } from "http";
import * as uuid from "uuid";
import * as WebSocket from "ws";
import { sendAction } from "../utils";
import { CustomSocket, Method, MethodRequest } from "./interfaces";

export type Middleware = (connection, req, data, next) => void;

export default class SocketApp {

    public server: WebSocket.Server;
    public methods: Method[] = [];
    public middlewares: Middleware[] = [];
    public users: {
        [id: string]: [{
            socket: CustomSocket,
            lastAction: Date,
        }],
    } = {};

    constructor(options: WebSocket.ServerOptions) {
        this.server = new WebSocket.Server(options);

        this.server.on("connection", (ws: CustomSocket, request) => {
            ws.id = uuid();
            ws.broadcast = this.broadcast;
            ws.on("message", (data) => {
                this.handleData(ws, request, data.toString());
            });
        });
    }

    public broadcast = (users: string[], action) => {
        for (const user of users) {
            if (!this.users[user]) {
                continue;
            }
            for (const { socket, lastAction } of this.users[user]) {
                if (socket.readyState === socket.CLOSED) {
                    console.log(socket.CLOSED);
                    console.log("Websocket is closed");
                    continue;
                }
                sendAction(socket, action);
            }
        }
    }

    public registerSocket(connection: CustomSocket, userId: string) {
        console.log(`Trying to register socket ${connection.id} to user ${userId}`);
        const sockets = this.users[userId];

        if (sockets) {
            let found = false;
            for (const socketEntry of sockets) {
                if (socketEntry.socket.id === connection.id) {
                    found = true;
                    socketEntry.lastAction = new Date();
                }
            }
            if (!found) {
                sockets.push({
                    socket: connection,
                    lastAction: new Date(),
                });
            }
        } else {
            this.users[userId] = [{
                socket: connection,
                lastAction: new Date(),
            }];
        }
    }

    public clearUnused() {
        Object.keys(this.users).forEach((key) => {
            for (const socketEntry of this.users[key]) {
                // TODO
            }
        });
    }

    public addMethod(type: string, action: (ws?: WebSocket, req?: IncomingMessage, data?: any) => void, use?: string[]) {
        this.methods.push({
            type,
            action,
            use,
        });
    }

    public addMidleware(middleware: Middleware) {
        this.middlewares.push(middleware);
    }

    public getServer() {
        return this.server;
    }

    private handleData = (connection: CustomSocket, req: IncomingMessage, data: string) => {
        try {
            const parsedData: MethodRequest = JSON.parse(data);
            const { type, data: payload } = parsedData;

            let currentMiddlewareIndex = -1;
            let toCall: Method;

            for (const method of this.methods) {
                if (method.type === type) {
                    toCall = method;
                    break;
                }
            }

            if (!toCall) {
                return;
            }

            const next = () => {
                if (payload.id) {
                    this.registerSocket(connection, payload.id);
                }
                currentMiddlewareIndex++;
                if (currentMiddlewareIndex === this.middlewares.length) {
                    toCall.action(connection, req, payload);
                    return;
                }
                const currentMiddleware = this.middlewares[currentMiddlewareIndex];
                if (toCall.use) {
                    if (toCall.use.indexOf(currentMiddleware.name) !== -1) {
                        currentMiddleware(connection, req, payload, next);
                    } else {
                        next();
                    }
                } else {
                    next();
                }
            };

            next();

        } catch (error) {
            console.log(error);
        }
    }

}
