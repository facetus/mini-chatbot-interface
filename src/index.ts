import SocketApp from './lib/socketApp';
import * as express from 'express';
import userControllers from './controllers/user';
import * as mongoose from 'mongoose';
import middleware from './middleware';
mongoose.connect('mongodb://localhost/test');

let db = mongoose.connection;

db.on('open', () => {
    const socket = new SocketApp({
        port: 8080
    });
    userControllers.forEach(({ type, action, use }) => {
        socket.addMethod(type, action, use);
    });
    socket.addMidleware(middleware.auth);
});

process.on('SIGKILL', () => {
    console.log('Gracefully closing connections and exiting');
    db.close();
    process.exit(0);
});