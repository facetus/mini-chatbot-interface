import { Entity, ObjectIdColumn, ObjectID, Column, CreateDateColumn } from "typeorm";

@Entity()
export default class Message {
    
    @ObjectIdColumn()
    id: ObjectID;

    @CreateDateColumn()
    timestamp: Date;

    @Column()
    message: string;

}