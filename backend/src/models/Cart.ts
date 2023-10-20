import { Document, Schema, Model, model, Types } from 'mongoose';
import { TLangText } from '../interfaces';



interface ICartItem {
    productId: string
    fiberId: string //id
    colorId: string  //id
    type: TLangText
    amount: number
}



const CartItem = new Schema({
    productId: {type: Types.ObjectId, ref: "Product", required: true},
    fiberId: {type: Types.ObjectId, ref: "Fiber", required: true},
    colorId: {type: Types.ObjectId, ref: "Color", required: true},
    type: {type: Object, required: true},
    amount: {type: Number, required: true},
});



module.exports = CartItem
export { ICartItem }