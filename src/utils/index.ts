import { ObjectID, BaseEntity } from "typeorm";

export const sendAction = (ws, action) => {
    ws.send(JSON.stringify(action));
}

export const findById = (target: ObjectID) => (value: { id: ObjectID}) => value.id === target