import { IImageSubFolder, IImages, TImageSizes } from './../interfaces';
import { Document, Schema, Model, model } from 'mongoose';
import { TLangText } from '../interfaces';

interface INews extends Document {
    _id: string
    date: Date
    header: TLangText
    short: TLangText
    text: TLangText
    images: IImages
}


const newsSchema = new Schema({
    date: {type: Date, required: true},
    header: {type: Object, required: true},
    short: {type: Object, required: true},
    text: {type: Object, required: true},
    images: {type: Object, required: false},
})

const News: Model<INews> = model<INews>('News', newsSchema);

module.exports = News
export {INews}