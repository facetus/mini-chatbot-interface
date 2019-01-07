import * as bcrypt from "bcrypt";
import { Document, model, Schema } from "mongoose";

const ObjectId = Schema.Types.ObjectId;
type ObjectId = typeof ObjectId;

export interface UserModel extends Document {
    _id: ObjectId;
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    friends: Array<UserModel | string>;
    invites: Array<UserModel | string>;
    invitations: Array<UserModel | string>;
    comparePassword: (password) => boolean;
    getRelations: () => UserModel;
}

const UserSchema = new Schema({
    username: String,
    password: String,
    email: String,
    firstName: String,
    lastName: String,
    invites: [{
        type: ObjectId,
        ref: "User",
    }],
    friends: [{
        type: ObjectId,
        ref: "User",
    }],
    invitations: [{
        type: ObjectId,
        ref: "User",
    }],
});

UserSchema.pre("save", async function(this: UserModel, next) {
    if (this.isModified("password")) {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
    }
    return next();
});

UserSchema.methods.comparePassword = async function(this: UserModel, password) {
    return await bcrypt.compare(password, this.password);
};

UserSchema.methods.getRelations = async function(this: UserModel) {
    await this.populate([{
        path: "friends",
        select: "username id",
    }, {
        path: "invitations",
        select: "username id",
    }, {
        path: "invites",
        select: "username id",
    }]).execPopulate();
    return this;
};

UserSchema.set("toJSON", {
    transform(doc, ret) {
        delete ret.password;
        return ret;
    },
});

export const User = model<UserModel>("User", UserSchema);
