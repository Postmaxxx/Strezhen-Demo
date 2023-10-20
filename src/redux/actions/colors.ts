import { IAction, IDispatch, IColor, IFetch, IFullState, IErrRes, TLangText, IMsgRes, ISendColor, TTypeRequest, } from "../../interfaces"
import { actionsListColors } from './actionsList'
import { APIList, DOMExceptions, fetchingFetch, successFetch } from "../../assets/js/consts";
import { fetchError, resErrorFiller } from "../../../src/assets/js/processors";


export const setLoadColors = <T extends IFetch>(payload: T):IAction<T> => ({
    type: actionsListColors.SET_LOAD_STATUS_COLORS,
    payload
});


export const setSendColors = <T extends IFetch>(payload: T):IAction<T> => ({
    type: actionsListColors.SET_SEND_STATUS_COLORS,
    payload
});


export const setColors = <T extends IColor[]>(payload: T):IAction<T> => ({
    type: actionsListColors.SET_DATA_COLORS,
    payload
});


interface IColorGet {
    urls: {
        thumb: string
        full: string
    }
    name: TLangText,
    _id: string,
    active: boolean
}

export const loadColors = () => {
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        getState().colors.load.controller?.abort(DOMExceptions.byFetch)
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.colors.get.timeout) //set time limit for fetch
        dispatch(setLoadColors({...fetchingFetch, controller}))  
        try {
            const response: Response = await fetch(APIList.colors.get.url, {
                signal: controller.signal,
                method: APIList.colors.get.method,
                headers: {
                    'Authorization': `Bearer ${getState().user.token}`,
                    "Content-Type": 'application/json',
                }
            })
            clearTimeout(fetchTimeout)
            if (response.status !== 200) {
                const result: IErrRes = await response.json()
                return dispatch(setLoadColors(resErrorFiller(result)))
            }
            const result: {colors: IColorGet[]} = await response.json()
            const resultProcessed = result.colors?.map((item) => {
                return {
                    _id: item._id,
                    name: item.name,
                    urls: item.urls,
                    active: item.active
                }
            })
            dispatch(setColors(resultProcessed))
            dispatch(setLoadColors({...successFetch}))
        } catch (e) {
            fetchError({ 
                e,
                dispatch,
                setter: setLoadColors,
                controller,
                comp: {en: 'Error loading colors', ru: ' Ошибка загрузки цветов'}
            })
        }
    }
}




export const sendColor = (color: ISendColor) => {
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        const controller = new AbortController()
        const typeOfRequest: TTypeRequest = color._id ? 'update' : 'create'
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.colors[typeOfRequest].timeout) //set time limit for fetch
        dispatch(setSendColors({...fetchingFetch, controller}))  
        
        const sendForm = new FormData()  
        const {files, ...colorToSend} = color
        sendForm.append('data', JSON.stringify(colorToSend))
        
        const colorFiles = [color.files.thumb, color.files.full]
        colorFiles.forEach(item => { sendForm.append('files', item, item.name) })
        try {
            const response: Response = await fetch(APIList.colors[typeOfRequest].url, {
                signal: controller.signal,
                method: APIList.colors[typeOfRequest].method,
                headers: {
                    'enctype': "multipart/form-data",
                    'Authorization': `Bearer ${getState().user.token}`
                },
                body: sendForm
            })
            clearTimeout(fetchTimeout)
            if (!response.ok) {
                const result: IErrRes = await response.json() //message, errors
                return dispatch(setSendColors(resErrorFiller(result)))
            }
            const result: IMsgRes = await response.json() //message, errors
            dispatch(setSendColors({...successFetch, message: result.message}))
        } catch (e) {
            fetchError({ 
                e,
                dispatch,
                setter: setSendColors,
                controller,
                comp: {en: 'Error saving color to db', ru: 'Ошибка сохранения цвета в бд'}
            })
        }
    }
}





export const deleteColor = (_id: string) => {
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.colors.delete.timeout) //set time limit for fetch
        dispatch(setSendColors({...fetchingFetch, controller}))  
        const token = getState().user.token 
        // to db
        try {
            const response: Response = await fetch(APIList.colors.delete.url, {
                signal: controller.signal,
                method: APIList.colors.delete.method,
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({_id})
            })
            if (response.status !== 200) {
                const result: IErrRes = await response.json() //message, errors
                return dispatch(setSendColors(resErrorFiller(result)))
            }
            const result: IMsgRes = await response.json() //message
            dispatch(setSendColors({...successFetch, message: result.message}))
        } catch (e) {
            fetchError({ 
                e,
                dispatch,
                setter: setSendColors,
                controller,
                comp: {en: 'Error deleting color from db', ru: 'Ошибка удаления цвета из бд'}
            })
        }
    }
}
