import { IAction, ICartItem, ICartState, IDispatch, IErrRes, IFetch, IFullState, ILoggingForm, IMsgRes, IUserLoginResOk, IUserState } from "../../interfaces";
import { actionsListUser } from './actionsList'
import { APIList, DOMExceptions, fetchingFetch, successFetch } from "../../assets/js/consts";
import dayjs from "dayjs";
import { fetchError, resErrorFiller } from "../../../src/assets/js/processors";


type TActionListKeys = keyof typeof actionsListUser;

export const setUser = <T extends Partial<IUserState>>(payload: T): IAction<T>=> ({
    type: actionsListUser.SET_USER as 'SET_USER',
    payload: payload
});


export const setAuth = <T extends IFetch>(payload: T):IAction<T> => ({
    type: actionsListUser.SET_USER_AUTH,
    payload: payload
});


export const setSendOrder = <T extends IFetch>(payload: T):IAction<T> => ({
    type: actionsListUser.SET_SEND_STATUS_ORDER,
    payload: payload
});


export const register = ({name, email, phone, password}: ILoggingForm) => {
    return async function(dispatch: IDispatch, getState: () => IFullState) {
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.user.register.timeout) //set time limit for fetch
        dispatch(setAuth({...fetchingFetch, controller}))  
        const localDate = dayjs().format('YYYY-MM-DD')
        try {
            const response = await fetch(APIList.user.register.url, {
                signal: controller.signal,
                method: APIList.user.register.method,
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({name, email, phone, password, localDate})
            })    
            clearTimeout(fetchTimeout)
            if (!response.ok) {
                const result: IErrRes = await response.json() //message, errors
                return dispatch(setAuth(resErrorFiller(result)))
            }
            dispatch(setAuth({...successFetch}))
            await login({email, password})(dispatch, getState)
        } catch (e) {  
            fetchError({ 
                e,
                dispatch,
                setter: setAuth,
                controller,
                comp: {en: 'user register', ru: 'регистрации пользователя'}
            }) 
        } 
    }
}




export const login = ({email, password}: Pick<ILoggingForm, "email" | "password">) => {         
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        const { user } = getState() //get current user state
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.user.login.timeout) //set time limit for fetch
        dispatch(setAuth({...fetchingFetch, controller}))          
        try { 
            const response: Response = await fetch(APIList.user.login.url, {
                signal: controller.signal,
                method: APIList.user.login.method,
                headers: {
                    "Content-Type": 'application/json',
                },
                body: JSON.stringify({email, password})
            })
            clearTimeout(fetchTimeout)
            if (!response.ok) {
                const result: IErrRes = await response.json() //message, errors
                return dispatch(setAuth(resErrorFiller(result)))
            }
            const result: IUserLoginResOk = await response.json() //message, errors
            dispatch(setUser({
                name: result.user.name,
                email: result.user.email,
                phone: result.user.phone,
                token: result.user.token,
                isAdmin: result.user.isAdmin,
                cart: {
                    ...user.cart,
                    items: result.user.cart,
                    load: successFetch,
                    fixed: result.user.fixed || []
                }
            }))
            dispatch(setAuth({...successFetch}))
            localStorage.setItem('user', JSON.stringify({token: result.user.token}))
        } catch (e) {   
            fetchError({ 
                e,
                dispatch,
                setter: setAuth,
                controller,
                comp: {en: 'user login', ru: 'входа пользователя'}
            })    
        } 
    }
}





export const loginWithToken = () => {   
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        const { user } = getState() //get current user state        
        const savedUser = localStorage.getItem('user')
        const currentToken: string = savedUser ? JSON.parse(savedUser).token : null
        if (!currentToken) {
            return 
        }
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.user.loginToken.timeout) //set time limit for fetch
        dispatch(setAuth({...fetchingFetch, controller}))    
        dispatch(setUser({...user, auth: fetchingFetch}))
        try {
            const response: Response = await fetch(APIList.user.loginToken.url, {
                    signal: controller.signal,
                    method: APIList.user.loginToken.method,
                    headers: {
                        "Content-Type": 'application/json',
                        'Authorization': `Bearer ${currentToken}`
                    },
                })
            clearTimeout(fetchTimeout)
            if (!response.ok) {
                const result: IErrRes = await response.json() //message, errors
                return dispatch(setAuth(resErrorFiller(result)))
            }
            const result: IUserLoginResOk = await response.json() //message, errors
            
            dispatch(setUser({
                name: result.user.name,
                email: result.user.email,
                phone: result.user.phone,
                token: result.user.token,
                isAdmin: result.user.isAdmin,
                cart: {
                    ...user.cart,
                    items: result.user.cart,
                    load: successFetch,
                    fixed: result.user.fixed || []
                }
            }))
            dispatch(setAuth({...successFetch}))
            localStorage.setItem('user', JSON.stringify({token: result.user.token}))
        } catch (e) {  
            fetchError({ 
                e,
                dispatch,
                setter: setAuth,
                controller,
                comp: {en: 'user login', ru: 'входа пользователя'}
            })           
        } 
    }
}


//////////////////////////////////////////////////////////////////////////////


interface ISendOrder {
    message: string
    files: File[]
}


export const sendOrder = ({message, files}: ISendOrder ) => {
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        const { user } = getState()
        const {lang} = getState().base
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.user.createOrder.timeout) //set time limit for fetch
        dispatch(setSendOrder({...fetchingFetch, controller}))       
        await sendCart()(dispatch, getState)
        const sendForm = new FormData()       
        files.forEach(item => {
            sendForm.append('files', item, item.name)
        })
        sendForm.append('lang', lang)
        sendForm.append('message', message)
        try {
            const response = await fetch(APIList.user.createOrder.url, {
                signal: controller.signal,
                method: APIList.user.createOrder.method,
                headers: {
                    'enctype': "multipart/form-data",
                    'Authorization': `Bearer ${user.token}`
                },
                body: sendForm
            })
            clearTimeout(fetchTimeout)
            if (!response.ok) {
                const result: IErrRes & {cart: ICartItem[]} & {fixed: ICartState["fixed"]}= await response.json() //message, errors
                if (response.status === 409) { //update cart with the new 
                    return dispatch(setUser({
                        cart: {
                            ...user.cart,
                            items: result.cart,
                            load: successFetch,
                            fixed: result.fixed
                        }
                    }))
                }
                return dispatch(setSendOrder(resErrorFiller(result)))
            }
            const result: IMsgRes = await response.json() //message
            dispatch(setSendOrder({...successFetch, message: result.message}))
        } catch (e) {    
            fetchError({ 
                e,
                dispatch,
                setter: setSendOrder,
                controller,
                comp: {en: 'creating order', ru: 'создания пользователя'}
            })           
        }
    }
}


interface ISendMessage {
    text: string
    files: File[]
}

export const sendMessage = ({text, files}: ISendMessage ) => {
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        const {lang} = getState().base
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.user.createMessage.timeout) //set time limit for fetch
        dispatch(setSendOrder({...fetchingFetch, controller}))        
        const sendForm = new FormData()       
        files.forEach(item => {
            sendForm.append('files', item, item.name)
        })
        sendForm.append('lang', lang)
        sendForm.append('message', text)
        try {
            const response = await fetch(APIList.user.createMessage.url, {
                signal: controller.signal,
                method: APIList.user.createMessage.method,
                headers: {
                    'enctype': "multipart/form-data",
                },
                body: sendForm
            })
            clearTimeout(fetchTimeout)
            if (response.status !== 200) {
                const result: IErrRes = await response.json() //message, errors
                return dispatch(setSendOrder(resErrorFiller(result)))
            }
            const result: IMsgRes = await response.json() //message
            dispatch(setSendOrder({...successFetch, message: result.message}))
        } catch (e) {     
            fetchError({ 
                e,
                dispatch,
                setter: setSendOrder,
                controller,
                comp: {en: 'creating message', ru: 'создания сообщения'}
            })         
        }
    }
}


//============================================== CART
export const setLoadCart = <T extends IFetch>(payload: T):IAction<T> => ({
    type: actionsListUser.SET_LOAD_STATUS_CART,
    payload
});


export const setSendCart = <T extends IFetch>(payload: T):IAction<T> => ({
    type: actionsListUser.SET_SEND_STATUS_CART,
    payload
});


export const addItem = <T extends ICartItem>(payload: T):IAction<T> => ({
    type: actionsListUser.ADD_ITEM_CART,
    payload
});

export const setCart = <T extends Partial<ICartState>>(payload: T):IAction<T> => ({
    type: actionsListUser.SET_CART,
    payload
});

export const changeItem = <T extends ICartItem>(payload: T):IAction<T> => ({
    type: actionsListUser.CHANGE_AMOUNT_CART,
    payload
});

export const removeItem = <T extends ICartItem>(payload: T):IAction<T> => ({
    type: actionsListUser.REMOVE_ITEM_CART,
    payload
});





export const sendCart = () => {
    return async function(dispatch: IDispatch, getState: () => IFullState) {
        const { cart } = getState().user
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.user.updateCart.timeout) //set time limit for fetch
        dispatch(setSendCart({...fetchingFetch, controller}))       
        
        const cartToSend = cart.items.map(item => ({
           amount: item.amount,
           type: item.type,
           colorId: item.color,
           fiberId: item.fiber,
           productId: item.product._id,
        }))
        try {
            const response: Response = await fetch(APIList.user.updateCart.url, {
                signal: controller.signal,
                method: APIList.user.updateCart.method,
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': `Bearer ${getState().user.token}`
                },
                body: JSON.stringify({newCart: cartToSend})
            })
            clearTimeout(fetchTimeout)
            if (response.status !== 200) {
                const result: IErrRes = await response.json() //message, errors
                return dispatch(setSendCart(resErrorFiller(result)))
            }
            const result: IMsgRes = await response.json() //message
            dispatch(setSendCart({...successFetch, message: result.message}))
        } catch (e) {   
            fetchError({ 
                e,
                dispatch,
                setter: setSendCart,
                controller,
                comp: {en: 'updating cart', ru: 'обновления корзины'}
            })            
        }
    }
}







export const updateCartItemAmount = (newItem: ICartItem) => {
    return async function(dispatch: IDispatch, getState: () => IFullState) {
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.user.updateCartItemAmount.timeout) //set time limit for fetch
        dispatch(setSendCart({...fetchingFetch, controller}))       
        
        const itemToSend = {
            productId: newItem.product._id,
            colorId: newItem.color,
            fiberId: newItem.fiber,
            type: newItem.type,
            amount: newItem.amount
        }
        try {
            const response: Response = await fetch(APIList.user.updateCart.url, {
                signal: controller.signal,
                method: APIList.user.updateCartItemAmount.method,
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': `Bearer ${getState().user.token}`
                },
                body: JSON.stringify({updatedItem: itemToSend})
            })
            clearTimeout(fetchTimeout)
            if (response.status !== 200) {
                const result: IErrRes = await response.json() //message, errors
                return dispatch(setSendCart(resErrorFiller(result)))
            }
            const result: IMsgRes = await response.json() //message
            dispatch(setSendCart({...successFetch, message: result.message}))
        } catch (e) {   
            fetchError({ 
                e,
                dispatch,
                setter: setSendCart,
                controller,
                comp: {en: 'updating cart item', ru: 'обновления товара корзины'}
            })            
        }
    }
}
