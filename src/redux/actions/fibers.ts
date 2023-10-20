import { IAction, IDispatch, IErrRes, IFetch, IFiber, IFullState, IMsgRes, ISendFiber, TLangText, TTypeRequest } from "../../interfaces"
import { actionsListFibers } from './actionsList'
import { APIList, DOMExceptions, fetchingFetch, successFetch } from "../../assets/js/consts";
import { fetchError, resErrorFiller } from "../../../src/assets/js/processors";


export const setLoadFibers = <T extends IFetch>(payload: T):IAction<T> => ({
    type: actionsListFibers.SET_LOAD_STATUS_FIBERS,
    payload: payload
});

export const setSendFibers = <T extends IFetch>(payload: T):IAction<T> => ({
    type: actionsListFibers.SET_SEND_STATUS_FIBERS,
    payload: payload
});

export const setDataFibers = <T extends Array<IFiber>>(payload: T):IAction<T> => ({
    type: actionsListFibers.SET_DATA_FIBERS,
    payload: payload
});

export const setSelectedFiber = <T extends IFiber['_id']>(payload: T):IAction<T> => ({
    type: actionsListFibers.SET_SELECTED_FIBER,
    payload: payload
});


export const loadFibers = () => {
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        getState().fibers.load.controller?.abort(DOMExceptions.byFetch)
        const controller = new AbortController()
        dispatch(setLoadFibers({...fetchingFetch, controller}))  
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.fibers.get.timeout) //set time limit for fetch
        try {
            const response = await fetch(APIList.fibers.get.url, {
                signal: controller.signal,
                method: APIList.fibers.get.method,
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${getState().user.token}`
                }
            })
            clearTimeout(fetchTimeout)
            if (response.status !== 200) {
                const result: IErrRes = await response.json()
                return dispatch(setLoadFibers(resErrorFiller(result)))
            }
            const result: {fibers: IFiber[], message: TLangText} = await response.json()
            dispatch(setDataFibers(result.fibers.map(item => { //to not get some redundant fields from item like _v 
                return {_id: item._id,
                    name: item.name,
                    text: item.text,
                    short: item.short,
                    images: item.images,
                    proscons: item.proscons,
                    colors: item.colors,
                    active: item.active,
                    params: Object.entries(item.params).reduce((acc, [key, value]) => {acc[key] = Number(value); return acc}, {} as {[key: string]: number}) as IFiber["params"]// convert strings to number
                }})))
            dispatch(setLoadFibers({...successFetch}))
        } catch (e) {
            fetchError({ 
                e,
                dispatch,
                setter: setLoadFibers,
                controller,
                comp: {en: 'Error while fiber loading', ru: 'Ошибка загрузки материалов'}
            })
        }
    }
}



export const sendFiber = (fiber: ISendFiber) => {
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        const typeOfRequest: TTypeRequest = fiber._id ? 'update' : 'create'
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.fibers[typeOfRequest].timeout) //set time limit for fetch
        dispatch(setSendFibers({...fetchingFetch, controller}))  
        const sendForm = new FormData()   

        const {files, ...fiberToSend} = fiber //exclude files from data
        sendForm.append('data', JSON.stringify(fiberToSend))
        fiber.files.forEach(item => { sendForm.append('files', item, item.name)})

        try { 
            const response: Response = await fetch(APIList.fibers[typeOfRequest].url, {
                signal: controller.signal,
                method: APIList.fibers[typeOfRequest].method,
                headers: {
                    'enctype': "multipart/form-data",
                    'Authorization': `Bearer ${getState().user.token}`
                },
                body: sendForm
            })

            clearTimeout(fetchTimeout)
            if (!response.ok) {
                const result: IErrRes = await response.json() //message, errors
                return dispatch(setSendFibers(resErrorFiller(result)))
            }
            const result: IMsgRes = await response.json() //message
            dispatch(setSendFibers({...successFetch, ...result}))
        } catch (e) { 
            fetchError({ 
                e,
                dispatch,
                setter: setSendFibers,
                controller,
                comp: {en: 'Error while fiber creating', ru: 'Ошибка создания материала'}
            })          
        }
    }
}


export const deleteFiber = (_id: string) => {
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.fibers.delete.timeout) //set time limit for fetch
        dispatch(setSendFibers({...fetchingFetch, controller}))  
        try {
            const response: Response = await fetch(APIList.fibers.delete.url,{
                signal: controller.signal,
                method: APIList.fibers.delete.method,
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': `Bearer ${getState().user.token}`
                },
                body: JSON.stringify({_id})
            })
            clearTimeout(fetchTimeout)
            if (response.status !== 200) {
                const result: IErrRes = await response.json()
                return dispatch(setSendFibers(resErrorFiller(result)))
            }
            const result: IMsgRes = await response.json() //message
            dispatch(setSendFibers({...successFetch, message: result.message}))
        } catch (e) {           
            fetchError({ 
                e,
                dispatch,
                setter: setSendFibers,
                controller,
                comp: {en: 'Error while fiber deleting', ru: 'Ошибка удаления каталога'}
            })     
        }
    }
}
