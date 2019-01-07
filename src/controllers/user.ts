import { ADD_NOTIFICATION, LOGIN_USER, SAVE_DETAILS, USER_MESSAGE, USER_RESULTS } from "../constants";
import { Method } from "../lib/socketApp";
import { acceptInvite, deleteFriend, friendInvite, getDetails, login, register, searchByUsername } from "../services/user";
import { sendAction } from "../utils";

const userController: Method[] = [
    {
        type: "login",
        action: async (ws, req, data) => {
            const { username, password } = data;
            const { error, token, expiresIn, id } = await login(username, password);
            if (error) {
                sendAction(ws, { type: USER_MESSAGE, data: { type: "error", text: error } });
                return;
            }
            sendAction(ws, { type: LOGIN_USER, data: { expiresIn, token } });
            const user = await getDetails(id);
            sendAction(ws, { type: SAVE_DETAILS, data: { ...user.toJSON() } });
        },
    },
    {
        type: "register",
        action: async (ws, req, data) => {
            const { username, password, confirmPassword, firstName, lastName, email } = data;
            const { error, user } = await register(username, firstName, lastName, email, password, confirmPassword);
            if (error) {
                sendAction(ws, { type: USER_MESSAGE, data: { type: "error", text: error } });
                return;
            }
            sendAction(ws, { type: USER_MESSAGE, data: { type: "success", text: "Account created succesfully you can now login" } });
        },
    },
    {
        type: "getUserInfo",
        action: (ws, req, data) => {
            // TODO
        },
    },
    {
        type: "inviteFriend",
        action: async (ws, req, data) => {
            const { id, friendId } = data;
        },
    },
    {
        use: ["auth"],
        type: "getDetails",
        action: async (ws, req, data) => {
            const { id } = data;
            const user = await getDetails(id);
            if (!user) {
                sendAction(ws, { type: "LOGOUT" });
                return;
            }
            sendAction(ws, { type: "SAVE_DETAILS", data: { ...user.toJSON() } });
        },
    },
    {
        use: ["auth"],
        type: "searchUsers",
        action: async (ws, req, data) => {
            const users = await searchByUsername(data.username, data.id);
            ws.broadcast([], {});
            sendAction(ws, { type: USER_RESULTS, data: users });
        },
    },
    {
        use: ["auth"],
        type: "addFriend",
        action: async (ws, req, data) => {
            const { id, friendId } = data;
            try {
                const { user, friend } = await friendInvite(id, friendId);
                ws.broadcast([friendId], { type: ADD_NOTIFICATION, data: { title: "Friend request recieved", text: `You have recieved a friend request from ${user.username}`, type: "success" } });
                ws.broadcast([id], { type: ADD_NOTIFICATION, data: { title: "Friend request sent", text: "The friend request has been recieved", type: "success" } });
                ws.broadcast([id], { type: "SAVE_DETAILS", data: { ...user.toJSON() } });
                ws.broadcast([friendId], { type: "SAVE_DETAILS", data: { ...friend.toJSON() } });
            } catch (error) {
                console.log("error");
                ws.broadcast([id], { type: ADD_NOTIFICATION, data: { title: "Cannot invite", text: "Cannot invite user, you are already friends with that user or the user does not exist", type: "error" } });
            }
        },
    },
    {
        use: ["auth"],
        type: "acceptInvite",
        action: async (ws, req, data) => {
            const { id, friendId } = data;
            try {
                const { user, friend } = await acceptInvite(id, friendId);
                ws.broadcast([friendId], { type: ADD_NOTIFICATION, data: { title: "Friend request accepted", text: `${user.username} has accepted your friend request`, type: "success" } });
                ws.broadcast([id], { type: "SAVE_DETAILS", data: { ...user.toJSON() } });
                ws.broadcast([friendId], { type: "SAVE_DETAILS", data: { ...friend.toJSON() } });
            } catch (error) {
                console.log("error");
            }
        },
    },
    {
        use: ["auth"],
        type: "deleteFriend",
        action: async (ws, req, data) => {
            const { id, friendId } = data;
            try {
                const { user, friend } = await deleteFriend(id, friendId);
                ws.broadcast([id], { type: "SAVE_DETAILS", data: { ...user.toJSON() } });
                ws.broadcast([friendId], { type: "SAVE_DETAILS", data: { ...friend.toJSON() } });
            } catch (error) {
                console.log("error");
            }
        },
    },
];

export default userController;
