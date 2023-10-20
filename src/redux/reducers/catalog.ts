import { IAction, ICatalogItem, ICatalogState, ICategory, IFetch, IProduct } from "../../interfaces"
import initialCatalogState from '../initialStates/catalog'
import { actionsListCatalog } from '../actions/actionsList'


type TActionListKeys = keyof typeof actionsListCatalog;


const reducerCatalog = (state: ICatalogState = initialCatalogState, action: {type: TActionListKeys, payload: unknown}): ICatalogState => {
    switch (action.type) {
        case actionsListCatalog.SET_LOAD_STATUS_CATEGORIES_LIST as 'SET_LOAD_STATUS_CATEGORIES_LIST':
            return {
                ...state, 
                catalog: {
                    ...state.catalog,
                    load: action.payload as IFetch
                }
            }
        case actionsListCatalog.SET_SEND_STATUS_CATEGORIES_LIST as 'SET_SEND_STATUS_CATEGORIES_LIST':
            return {
                ...state, 
                catalog: {
                    ...state.catalog,
                    send: action.payload as IFetch
                }
            }
        case actionsListCatalog.SET_DATA_CATEGORIES_LIST as 'SET_DATA_CATEGORIES_LIST': 
            const categoriesList = action.payload as ICatalogItem[]
            return {
                ...state, 
                catalog: {
                    ...state.catalog,
                    list: categoriesList
                }
            }

        case actionsListCatalog.SET_LOAD_STATUS_CATEGORY as 'SET_LOAD_STATUS_CATEGORY': 
            const dataLoadingCategory = action.payload as IFetch
            return {
                ...state, 
                category: {
                    ...state.category,
                    loadCategory: dataLoadingCategory
                }
            }
        case actionsListCatalog.SET_DATA_CATEGORY as 'SET_DATA_CATEGORY': 
            const dataCategory = action.payload as Omit<ICategory, "loadCategory" | 'page' | 'product' | "loadProduct">
            return {
                ...state, 
                category: {
                    ...state.category,
                    ...dataCategory
                }
            }

        case actionsListCatalog.SET_LOAD_STATUS_PRODUCT as 'SET_LOAD_STATUS_PRODUCT': 
            return {
                ...state, 
                category: {
                    ...state.category,
                    loadProduct: action.payload as IFetch
                }
            }
        case actionsListCatalog.SET_SEND_STATUS_PRODUCT as 'SET_SEND_STATUS_PRODUCT': 
            return {
                ...state, 
                category: {
                    ...state.category,
                    sendProduct: action.payload as IFetch
                }
            }
        case actionsListCatalog.SET_DATA_PRODUCT as 'SET_DATA_PRODUCT': 
            const product = action.payload as IProduct
            return {
                ...state, 
                category: {
                    ...state.category,
                    product: product
                }
            }

        default: {
            const missedSomeActions:never = action.type;
            return {
                ...state   
            };
        }
    }
}

export default reducerCatalog

/*

        case actionsListCatalog.SET_DATA_PRODUCT:            
            const newProps: Partial<IProduct> = action.payload as IProduct
            const newProduct: IProduct = {...state.category.product}
            Object.keys(newProps).forEach(key => {
                newProduct[key as keyof IProduct] = newProps[key as keyof IProduct] as never;
            })
            return {
                ...state, 
                category: {
                    ...state.category,
                    product: newProduct
                }
            }*/