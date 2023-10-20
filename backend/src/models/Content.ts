import { Document, Schema, Model, model } from 'mongoose';
import { IImageSubFolder, IImages } from '../interfaces';

interface IContent extends Document {
    carousel: {
        images: IImages
    }
}

const contentSchema = new Schema({
    carousel: {type: Object, required: true},
})

const Content: Model<IContent> = model<IContent>('Content', contentSchema);

module.exports = Content
export {IContent}