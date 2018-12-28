import { sendAction } from "../utils";
import { USER_MESSAGE, LOGIN_USER } from "../constants";
import { login, register } from '../services/user';

export default [{
    type: 'login',
    action: async (ws, req, data) => {
            const { username, password } = data;
            const { error, token, expiresIn } = await login(username, password);
            if (error) {
                sendAction(ws, { type: USER_MESSAGE, data: { type: 'error', text: error } });
                return;
            }
            sendAction(ws, { type: LOGIN_USER, data: { expiresIn, token } });
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
            const { id } = req;
        }
    }
]