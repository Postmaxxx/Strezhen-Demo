import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'
import reducerBase from "./reducers/base";
import reducerNews from "./reducers/news";
import reducerFibers from './reducers/fibers';
import reducerCatalog from './reducers/catalog';
import reducerColors from './reducers/colors';
import reducerUser from './reducers/user';
import reducerContent from './reducers/content';
import reducerOrders from './reducers/orders';
import { composeWithDevTools } from '@redux-devtools/extension';

export const rootReducer = combineReducers({
    base: reducerBase,
    news: reducerNews,
    fibers: reducerFibers,
    catalog: reducerCatalog,
    colors: reducerColors,
    user: reducerUser,
    content: reducerContent,
    orders: reducerOrders
});


const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));
 
export default store; 