import { getRepository } from 'typeorm';

import User from '../entity/User';
import Chat from '../entity/Chat';

export async function getAllChats(id: string) {
    const userRepo = getRepository(User);
    const chatRepo = getRepository(Chat);
    const test = chatRepo.find({
        where: {
            participants: id
        }
    })
}


export async function createChat() {
    const userRepo = getRepository(User);
    const chatRepo = getRepository(Chat);
}