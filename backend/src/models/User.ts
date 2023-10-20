import { Document, Schema, Model, model, Types } from 'mongoose';
import { ICartItem } from './Cart';
const CartItem = require("../models/Cart")





interface IUser extends Document {
    date: string
    email: string,
    password: string,
    phone: string,
    name: string,
    cart: ICartItem[]
    orders: string[]
}


const userSchema = new Schema({
    date: {type: String, required: false},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    phone: {type: String, required: true},
    name: {type: String, required: true},
    cart: [{type: CartItem, required: false}],
    orders: [{type: Types.ObjectId, ref: 'Order', required: false}]
})


const User: Model<IUser> = model<IUser>('User', userSchema);

module.exports = User
export { IUser }