import { Document, Schema, Model, model } from 'mongoose';
import { TLangText } from '../interfaces';

interface IColor extends Document {
    _id: string
    name: TLangText
    urls: {
        thumb: string
        full: string
    }
    active: boolean
}

const colorsSchema = new Schema({
    name: {type: Object, required: true},
    urls: {type: Object, required: true},
    active: {type: Boolean, required: false, default: true}
})

const Colors: Model<IColor> = model<IColor>('Colors', colorsSchema);

module.exports = Colors
export {IColor}