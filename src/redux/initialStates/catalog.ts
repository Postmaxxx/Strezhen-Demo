import { empty, emptyImages, resetFetch } from '../../assets/js/consts';
import { ICatalogState } from "../../interfaces"

const initialCatalog = {
    catalog: {
        load: resetFetch,
        send: resetFetch,
        list: []
    },
    category: {
        _id: '',
        loadCategory: resetFetch,
        loadProduct: resetFetch,
        sendProduct: resetFetch,
        products: [],
        product: {
            _id: '',
            //price: 0,
            name: {...empty},
            text: {...empty},
            text_short: {...empty},
            images: {...emptyImages},
            fibers: [],
            mods: [],
            category: ''
        }
    }
} satisfies ICatalogState

export default initialCatalog