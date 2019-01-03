import { verify } from 'jsonwebtoken';
import { SECRET } from '../../.env';
import { sendAction } from '../utils';

export default {
    auth: (connection, req, data, next) => {
        try {
            const { token } = data;
            let { id } : any = verify(token, SECRET);
            data.id = id;
            next();
            return;
        } catch (error) {
            sendAction(connection, { type: 'LOGOUT' });
        }
    }
}