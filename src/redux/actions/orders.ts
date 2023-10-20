import { IAction, IDispatch, IErrRes, IFetch, IFilterUser, IFullState, IMsgRes, IOrdersState, OrderType } from "../../interfaces"
import { actionsListOrders } from './actionsList'
import { APIList, DOMExceptions, fetchingFetch, successFetch} from "../../assets/js/consts";
import { fetchError, resErrorFiller } from "../../../src/assets/js/processors";



export const setSendOrders = <T extends IFetch>(payload: T):IAction<T> => ({
    type: actionsListOrders.SET_SEND_STATUS_ORDERS,
    payload
});


export const setLoadOrders = <T extends IFetch>(payload: T):IAction<T> => ({
    type: actionsListOrders.SET_LOAD_STATUS_ORDERS,
    payload
});


export const setOrders = <T extends IOrdersState['users']>(payload: T):IAction<T> => ({
    type: actionsListOrders.SET_ORDERS,
    payload
});



interface ILoadOrders {
    from: string
    to: string
    userId: string
    status: string 
}

export const loadOrders = ({from, to, userId, status}: ILoadOrders) => {
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        getState().orders.load.controller?.abort(DOMExceptions.byFetch)
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.orders.getSome.timeout) //set time limit for fetch
        dispatch(setLoadOrders({...fetchingFetch, controller}))  
        try {
            const url = `${APIList.orders.getSome.url}?` + new URLSearchParams({from, to, userId, status})
            const response: Response = await fetch(url, {
                signal: controller.signal,
                method: APIList.orders.getSome.method,
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': `Bearer ${getState().user.token}`
                },
            })
            clearTimeout(fetchTimeout)
            if (response.status !== 200) {
                const result: IErrRes = await response.json() //message, errors
                return dispatch(setLoadOrders(resErrorFiller(result)))
            }
            const result = await response.json() //message, errors
            dispatch(setOrders(result.users))
            dispatch(setLoadOrders({...successFetch}))
        } catch (e) {
            fetchError({ 
                e,
                dispatch,
                setter: setLoadOrders,
                controller,
                comp: {en: 'loading orders', ru: 'загрузки заказов'}
            })
        }
    }
}



export const changeOrderStatus = (orderId: string, newStatus: OrderType) => {
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.orders.editStatus.timeout) //set time limit for fetch
        dispatch(setSendOrders({...fetchingFetch, controller}))  
        try {
            const response: Response = await fetch(APIList.orders.editStatus.url, {
                signal: controller.signal,
                method: APIList.orders.editStatus.method,
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': `Bearer ${getState().user.token}`
                },
                body: JSON.stringify({orderId, newStatus})
            })
            clearTimeout(fetchTimeout)
            if (response.status !== 200) {
                const result: IErrRes = await response.json() //message, errors
                return dispatch(setSendOrders(resErrorFiller(result)))
            }
            const result: IMsgRes = await response.json() //message, errors
            dispatch(setSendOrders({...successFetch, message: result.message}))
        } catch (e) {
            fetchError({ 
                e,
                dispatch,
                setter: setSendOrders,
                controller,
                comp: {en: 'editing order', ru: 'редактирования заказа'}
            })
        }
    }
}






export const setLoadUsers = <T extends IFetch>(payload: T):IAction<T> => ({
    type: actionsListOrders.SET_LOAD_USERLIST,
    payload
});


export const setUserList = <T extends IFilterUser[]>(payload: T):IAction<T> => ({
    type: actionsListOrders.SET_USERLIST,
    payload
});



export const loadUsers = () => {
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        getState().orders.userList.load.controller?.abort(DOMExceptions.byFetch)
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.orders.getUsers.timeout) //set time limit for fetch
        dispatch(setLoadUsers({...fetchingFetch, controller}))  
        try {
            const response: Response = await fetch(APIList.orders.getUsers.url, {
                signal: controller.signal,
                method: APIList.orders.getUsers.method,
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': `Bearer ${getState().user.token}`
                },
            })
            clearTimeout(fetchTimeout)
            if (response.status !== 200) {               
                const result: IErrRes = await response.json() //message, errors
                return dispatch(setLoadUsers(resErrorFiller(result)))
            }
            const result = await response.json() //message, errors
            dispatch(setUserList(result.userList))
            dispatch(setLoadUsers({...successFetch}))
        } catch (e) {
            fetchError({ 
                e,
                dispatch,
                setter: setLoadUsers,
                controller,
                comp: {en: 'loading users', ru: 'загрузки пользователей'}
            })
        }
    }
}
