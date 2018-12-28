import "reflect-metadata";
import { createConnection } from "typeorm";
import SocketApp from './lib/socketApp';
import * as express from 'express';
import userControllers from './controllers/user';

createConnection().then(async connection => {
    const socket = new SocketApp({
        port: 8080
    })

    userControllers.forEach(({ type, action }) => {
        socket.addMethod(type, action);
    });
    
}).catch(error => console.log(error));
