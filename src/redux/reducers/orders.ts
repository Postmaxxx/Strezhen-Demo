import { IAction, ICartItem, IFetch, IFilterUser, IOrdersState, IUserOrders } from "../../interfaces"
import initialOrderState from '../initialStates/orders'
import { actionsListOrders } from '../actions/actionsList'


type TActionListKeys = keyof typeof actionsListOrders;

const reducerOrders = (state:IOrdersState = initialOrderState, action: {type: TActionListKeys, payload: unknown}): IOrdersState => {
    switch (action.type) {
        case actionsListOrders.SET_SEND_STATUS_ORDERS as 'SET_SEND_STATUS_ORDERS': 
            return {
                ...state, 
                send: action.payload as IFetch
            }
        case actionsListOrders.SET_LOAD_STATUS_ORDERS as 'SET_LOAD_STATUS_ORDERS': 
            return {
                ...state, 
                load: action.payload  as IFetch
            }
        case actionsListOrders.SET_ORDERS as 'SET_ORDERS': 
            return {
                ...state, 
                users: action.payload as IUserOrders[]
            }


        case actionsListOrders.SET_LOAD_USERLIST as 'SET_LOAD_USERLIST': 
            return {
                ...state, 
                userList: {
                    ...state.userList,
                    load: action.payload as IFetch
                }
            }
        case actionsListOrders.SET_USERLIST as 'SET_USERLIST': 
            return {
                ...state, 
                userList: {
                    ...state.userList,
                    list: action.payload as IFilterUser[]
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

export default reducerOrders