import { sendAction } from "../utils";
import { USER_MESSAGE, LOGIN_USER, SAVE_DETAILS, USER_RESULTS } from "../constants";
import { login, register, getDetails, searchByUsername } from '../services/user';
import { Method } from "../lib/socketApp";

const userController: Method[] = [{
    type: 'login',
    action: async (ws, req, data) => {
            const { username, password } = data;
            const { error, token, expiresIn, id } = await login(username, password);
            if (error) {
                sendAction(ws, { type: USER_MESSAGE, data: { type: 'error', text: error } });
                return;
            }
            sendAction(ws, { type: LOGIN_USER, data: { expiresIn, token } });
            let user = await getDetails(id);
            sendAction(ws, { type: SAVE_DETAILS, data: { ...user.toJSON() }})
        }
    },{
    type: 'register',
    action: async (ws, req, data) => {
            const { username, password, confirmPassword, firstName, lastName, email } = data;
            const { error, user } = await register(username, firstName, lastName, email, password, confirmPassword);
            if (error) {
                sendAction(ws, { type: USER_MESSAGE, data: { type: 'error', text: error } });
                return;
            }
            sendAction(ws, { type: USER_MESSAGE, data: { type: 'success', text: 'Account created succesfully you can now login' } });
        }
    }, {
        type: 'getUserInfo',
        action: (ws, req, data) => {
        }
    },{
        type: 'inviteFriend',
        action: async (ws, req, data) => { 
            const { id, friendId } = data;
        }
    }, {
        use: ['auth'],
        type: 'getDetails',
        action: async (ws, req, data) => {
            const { id } = data;
            const user = await getDetails(id);
            if(!user) {
                sendAction(ws, { type: 'LOGOUT'})
                return;
            }
            sendAction(ws, { type: 'SAVE_DETAILS', data: { ...user.toJSON() }})
        },
    }, {
        use: ['auth'],
        type: 'searchUsers',
        action: async (ws, req, data) => {
            const users = await searchByUsername(data.username, data.id);
            sendAction(ws, { type: USER_RESULTS, data: users })
        }
    }, {
        use: ['auth'],
        type: 'addFriend',
        action: async (ws, req, data) => {
            const { id } = data;
        }
    }
]
export default userController;