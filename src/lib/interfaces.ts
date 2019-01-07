import { IncomingMessage } from "http";
import * as WebSocket from "ws";

export interface Method {
    type: string;
    action?: (ws?: CustomSocket, req?: IncomingMessage, data?: any) => void;
    use?: string[];
}

export interface MethodRequest {
    type: string;
    data: any;
}

export interface CustomSocket extends WebSocket {
    id: string;
    broadcast: (users: string[], action: any) => void;
}

export type Middleware = (connection, req, data, next) => void;