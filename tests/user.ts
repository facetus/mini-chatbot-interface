// import { register, login } from '../src/services/user';
// import { createConnection, getRepository, getManager } from 'typeorm';
// import User from '../src/entity/User';
// (async () => {
//     const connection = await createConnection();
//     let { user, error } = await register('test_user', 'nikos', 'polikandriotis', 'test@email.com', '123456');
//     console.log(error);
//     let result = await login('test_user', '123456');
//     console.log(result);
//     // await getRepository(User).delete(user);
//     connection.close();
// })()