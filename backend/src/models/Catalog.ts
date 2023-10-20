import { TLangText } from '../interfaces';
import {Document, Schema, Model, model} from 'mongoose'

interface ICatalog extends Document {
    name: TLangText
}



const CatalogSchema = new Schema({
    name: {type: Object, required: true}
})



const Catalog: Model<ICatalog> = model<ICatalog>('Catalog', CatalogSchema);

module.exports = Catalog
export { ICatalog }

