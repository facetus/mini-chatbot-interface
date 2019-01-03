import { ObjectID, BaseEntity } from "typeorm";

export const sendAction = (ws, action) => {
    ws.send(JSON.stringify(action));
}

export const findById = (target: Number) => (value: { id: Number}) => value.id === target