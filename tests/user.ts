import * as mongoose from "mongoose";
import { User } from "../src/entity/User";
import { acceptInvite, friendInvite, login, register } from "../src/services/user";

mongoose.connect("mongodb://localhost/test");
const db = mongoose.connection;
db.on("open", async () => {
    const user = await User.findOne({
        username: "test_user",
    }).exec();
    const friend = await User.findOne({
        username: "nikpolik",
    });
    await acceptInvite(friend.id, user.id);
    db.close();
});

// import { friendInvite, acceptInvite } from '../src/services/user';

// (async () => {
//     const connection = await createConnection();
//     const userRepo = getRepository(User);
//     const test_user = (await userRepo.find({
//         where: {
//             username: 'test_user'
//         },
//         relations: ['friends', 'invites', 'invitations']
//     }))[0];

//     const nikpolik = (await userRepo.find({
//         where: {
//             username: 'nikos'
//         },
//         relations: ['friends', 'invites', 'invitations']
//     }))[0];

//     console.log(nikpolik.invites);
//     console.log(test_user.invitations);
//     friendInvite(test_user.id, nikpolik.id);
//     acceptInvite(nikpolik.id, test_user.id);
// })();
