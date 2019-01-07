import * as bcrypt from 'bcrypt';
import { User, UserModel } from "../entity/User";
import * as jwt from 'jsonwebtoken';
import { SECRET } from '../../.env';
import { findById } from "../utils";
import { Document, Schema } from 'mongoose';

let searchById = (id) => (value) => {
    console.log(`checking ${id} with ${value._id} and found ${value.id === id}`);
    return value._id == id
}

export async function register(username, firstName, lastName, email, password, confirmPassword): Promise<{ user?: Document, error?: string }> {
    try {
        // const connection = await createConnection();
        if (!username || !password || !firstName || !lastName || !email || !confirmPassword) {
            throw new Error('Not all fields are submited');
        }
        if(password !== confirmPassword) {
            throw new Error('Passwords are not matching')
        }
        let oldUser = await User.findOne({
            username
        });
        if (oldUser) {
            throw new Error('User already exists')
        }
        let user = new User({
            password,
            username,
            email,
            firstName,
            lastName
        });
        await user.save();
        return {
            user
        }
    } catch (error) {
        return {
            error: error.message
        }
    }
}

export async function login(username, password): Promise<{ token?: string, error?: string, expiresIn?: number, id?: string}> {
    try {
        const user = await User.findOne({
            username
        }).exec();
        if(!user) {
            throw new Error('username or password incorrect');
        }
        let matches = user.comparePassword(password);
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
            expiresIn: 1000 * 60 * 60 * 24,
            id: user.id
        }
    } catch(error) {
        return {
            error: error.message
        }
    }
}

export async function friendInvite(id: number, friendId: number) {
    const [friend, user] = [
        await User.findById(friendId),
        await User.findById(id)
    ]
    let isFriend = user.friends.findIndex(searchById(friend.id)) !== -1;
    let didInvite = user.invitations.findIndex(searchById(friend.id)) !== -1;
    let isInvited = friend.invites.findIndex(searchById(user.id)) !== -1;
    if (isInvited || didInvite || isFriend) {
        console.log('error?');
        throw new Error('You are already friends or you have invited that user');
    }
    user.invitations.push(friend.id);
    friend.invites.push(user.id);
    await user.save();
    await friend.save();
    return {
        user: await user.getRelations(),
        friend: await friend.getRelations()
    }
}

export async function acceptInvite(id: string, friendId: string) {
    const [friend, user] = [
        await User.findById(friendId),
        await User.findById(id)
    ]
    //its important to not use triple equals here as it will not match String with ObjectId...
    let isInvited = user.invites.findIndex(searchById(friend.id));
    let didInvite = friend.invitations.findIndex(searchById(user.id));
    if(isInvited === -1 || didInvite === -1) {
        throw new Error('You are not friends with that user');
    }
    user.invites.splice(isInvited, 1);
    friend.invitations.splice(didInvite, 1);
    user.friends.push(friend.id);
    friend.friends.push(friend.id);
    [await user.save(), await friend.save()];
    [await user.getRelations(), await friend.getRelations()]
    return {
        user,
        friend
    }
}

export async function deleteFriend(id: string, friendId: string) {
    const [user, friend] = [
        await User.findById(id),
        await User.findById(friendId)
    ];
    let userIndex = user.friends.findIndex(searchById(friend.id));
    let friendIndex = friend.friends.findIndex(searchById(user.id));
    if(userIndex === -1 || friendIndex === -1) {
        throw new Error('You are not friends with that user');
    }
    user.friends.splice(userIndex, 1);
    friend.friends.splice(friendIndex, 1);
    [await user.save(), await friend.save()];
    [await user.getRelations(), await friend.getRelations()];
    return {
        user,
        friend
    }    
}

export async function getDetails(id: string) {
    let user = await User.findById(id);
    await user.getRelations();
    return user;
}

export async function searchByUsername(username: string, id: string) {
    const result = await User.find({
        username: { $regex: username, $options: 'i'},
        _id: { $ne: id }
    }).select('_id username').exec(); 
    return result;
}