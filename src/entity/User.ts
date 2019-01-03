import { Schema, Document, model } from 'mongoose';
import * as bcrypt from 'bcrypt';


const ObjectId = Schema.Types.ObjectId;
type ObjectId = typeof ObjectId;

export interface UserModel extends Document {
    _id: ObjectId;
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    friends: (UserModel | string)[];
    invites: (UserModel | string)[];
    invitations: (UserModel | string)[];
    comparePassword: (password) => boolean
}

const UserSchema = new Schema({
    username: String,
    password: String,
    email: String,
    firstName: String,
    lastName: String,
    invites: [{
        type: ObjectId,
        ref: 'User'
    }],
    friends: [{
        type: ObjectId,
        ref: 'User'
    }],
    invitations: [{
        type: ObjectId,
        ref: 'User'
    }]
});

UserSchema.pre('save', async function (this: UserModel, next) {
    if (this.isModified('password')) {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
    }
    return next();
});

UserSchema.methods.comparePassword = async function (this: UserModel, password) {
    return await bcrypt.compare(password, this.password);
}

UserSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.password;
        return ret;
    }
});

export const User = model<UserModel>('User', UserSchema);
