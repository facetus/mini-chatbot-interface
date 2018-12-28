import { Entity, ObjectIdColumn, ObjectID, Column, BeforeInsert, BeforeUpdate, ManyToMany, JoinTable } from "typeorm";
import * as bcrypt from 'bcrypt';
@Entity()
export default class User {

    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    password: string;

    @ManyToMany(() => User, {
        cascade: true,
        eager: true
    })
    @JoinTable()
    friends: User[]

    @ManyToMany(() => User, {
        cascade: true,
    })
    @JoinTable()
    invites: User[]

    @ManyToMany(() => User, {
        cascade: true,
    })
    @JoinTable()
    invitations: User[]

    @BeforeInsert()
    private async hashPassword(): Promise<void> {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
    }

}
