import { getManager, getRepository, ObjectID } from "typeorm";
import * as bcrypt from 'bcrypt';
import User from "../entity/User";
import * as jwt from 'jsonwebtoken';
import { SECRET } from '../../.env';
import { findById } from "../utils";

export async function getInfo(id) {
    try {
        const user = getRepository(User).findOne(id);
        if(!user) {
            throw new Error('Error finding user in the database');
        }
        return {
            user
        }
    } catch (error) {

    }
}

export async function register(username, firstname, lastname, email, password, confirmPassword): Promise<{ user?: User, error?: string }> {
    try {
        // const connection = await createConnection();
        if(!username || !password || !firstname || !lastname || !email || !confirmPassword) {
            return {
                error: 'Not all fields are submited'
            }
        }
        if(password !== confirmPassword) {
            return {
                error: 'Passwords are not matching'
            }
        }
        const user = new User();
        user.firstName = firstname;
        user.lastName = lastname;
        user.password = password;
        user.email = email;
        user.username = username;
        await getManager().save(user);
        return {
            user
        }
    } catch (error) {
        return {
            error: error.message
        }
    }
}

export async function login(username, password): Promise<{ token?: string, error?: string, expiresIn?: number}> {
    try {
        const user: User = await getRepository(User).findOne({ username });
        if(!user) {
            throw new Error('username or password incorrect');
        }
        let matches = await bcrypt.compare(password, user.password);
        if(!matches) {
            throw new Error('username or password incorrect');
        }
        const token = jwt.sign({
            id: user.id
        }, SECRET, {
            expiresIn: '1d'
        });
        return {
            token,
            expiresIn: 1000 * 60 * 60 * 24
        }
    } catch(error) {
        return {
            error: error.message
        }
    }
}

export async function friendInvite(id: ObjectID, friendId: ObjectID) {
    const userRepo = getRepository(User);
    const [friend, user] = [
        await userRepo.findOne(friendId),
        await userRepo.findOne(id)
    ]
    if (!user) {
        return;
    }
    const friendIndex = friend.friends.findIndex(findById(user.id));
    const userIndex = user.friends.findIndex(findById(friend.id));
    if (!(friendIndex !== -1) || !(userIndex !== -1)) {
        return;
    }
    friend.invitations.push(user);
    user.invites.push(user);
    userRepo.save(user);
    userRepo.save(friend);
}

export async function acceptInvite(id: ObjectID, friendId: ObjectID) {
    const userRepo = getRepository(User);
    const [friend, user] = [
        await userRepo.findOne(friendId),
        await userRepo.findOne(id)
    ]
    if (!user || !friend) {
        return;
    }
    const invitationIndex = friend.invitations.findIndex(findById(user.id));
    const inviteIndex = user.invites.findIndex(findById(friend.id));
    if (!(invitationIndex !== -1) || !(inviteIndex !== -1)) {
        return;
    }
    friend.friends.push(user);
    user.friends.push(friend);
    delete user.invites[inviteIndex];
    delete friend.invitations[inviteIndex];
}