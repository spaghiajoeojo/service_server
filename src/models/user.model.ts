import * as config from 'config';
import * as jwt from 'jsonwebtoken';
import * as Joi from 'joi';
import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    generateAuthToken: Function;
}

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255
    }
});


//custom method to generate authToken 
UserSchema.methods.generateAuthToken = function () {
    const day = 30;
    const token = jwt.sign({
        _id: this._id,
        expiration: config.get('lifetime_token') != -1 ? (new Date().getTime() + (config.get<number>('lifetime_token') * 1000)) : -1
    }, config.get('token_salt')); //get the private key from the config file -> environment variable
    return token;
}

export default mongoose.model<IUser>('User', UserSchema);
//function to validate user 
export function validate(user) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(3).max(255).required()
    });

    return schema.validate(user);
}