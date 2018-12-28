import { Entity, ObjectIdColumn, ObjectID, Column, UpdateDateColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn } from "typeorm";
import User from './User';
import Message from './Message';

@Entity()
export default class Chat {
    
    @ObjectIdColumn()
    id: ObjectID;

    @ManyToMany(type => User, {
        cascade: true,
        eager: true
    })
    @JoinTable()
    participants: User[]


    @ManyToOne(type => Message, {
        eager: true
    })
    @JoinColumn()
    messages: Message[]

    @UpdateDateColumn()
    lastUpdate: Date
    
}