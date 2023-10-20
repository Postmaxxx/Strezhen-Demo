import { Document, Schema, Model, model } from 'mongoose';


interface IChangesProps {
    news: boolean
    catalog: boolean
    fibers: boolean
    colors: boolean
    products: boolean
}

interface IChanges extends IChangesProps, Document {}


const changesSchema = new Schema({
    news: {type: Boolean, required: true},
    catalog: {type: Boolean, required: true},
    fibers: {type: Boolean, required: true},
    colors: {type: Boolean, required: true},
    products: {type: Boolean, required: true},
})

const News: Model<IChanges> = model<IChanges>('Changes', changesSchema);

module.exports = News
export {IChanges, IChangesProps}