import { IAction, ICarouselMax, IContentState, IDispatch, IErrRes, IFetch, IFullState, IMsgRes, } from "../../interfaces"
import { actionsListContent } from './actionsList'
import { APIList, DOMExceptions, fetchingFetch, successFetch } from "../../assets/js/consts";
import { fetchError, resErrorFiller } from "../../../src/assets/js/processors";



export const setSendContent = <T extends IFetch>(payload: T):IAction<T> => ({
    type: actionsListContent.SET_SEND_STATUS_CONTENT,
    payload: payload
});


export const setLoadContent = <T extends IFetch>(payload: T):IAction<T> => ({
    type: actionsListContent.SET_LOAD_STATUS_CONTENT,
    payload: payload
});


export const setContent = <T extends IContentState>(payload: T):IAction<T> => ({
    type: actionsListContent.SET_CONTENT,
    payload: payload
});



export const sendCarousel = (files: File[]) => {
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.content.carouselMax.update.timeout) //set time limit for fetch
        dispatch(setSendContent({...fetchingFetch, controller}))
        if (files.length === 0 || !files) return 
        dispatch(setSendContent(fetchingFetch))
        const sendForm = new FormData()       
        files.forEach(item => {
            sendForm.append('files', item, item.name)
        })
        try {
            const response: Response = await fetch(APIList.content.carouselMax.update.url, {
                signal: controller.signal,
                method: APIList.content.carouselMax.update.method,
                headers: {
                    'enctype': "multipart/form-data",
                    'Authorization': `Bearer ${getState().user.token}`
                },
                body: sendForm
            })
            clearTimeout(fetchTimeout)
            if (response.status !== 200) {
                const result: IErrRes = await response.json() //message, errors
                return dispatch(setSendContent(resErrorFiller(result)))
            }
            const result: IMsgRes = await response.json() //message
            dispatch(setSendContent({...successFetch, message: result.message}))
        } catch (e) {
            fetchError({ 
                e,
                dispatch,
                setter: setSendContent,
                controller,
                comp: {en: 'updating content', ru: 'обновления контента'}
            })          
        }
    }
}





export const loadCarousel = () => {
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        getState().content.load.controller?.abort(DOMExceptions.byFetch)
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.content.carouselMax.get.timeout) //set time limit for fetch
        dispatch(setLoadContent({...fetchingFetch, controller}))
        try {
            const response: Response = await fetch(APIList.content.carouselMax.get.url, {
                signal: controller.signal,
                method: APIList.content.carouselMax.get.method,
                headers: {
                    "Content-Type": 'application/json',
                },
            })
            clearTimeout(fetchTimeout)
            if (response.status !== 200) {
                const result: IErrRes = await response.json() //message, errors
                return dispatch(setLoadContent(resErrorFiller(result)))
            }
            const result: {carousel: ICarouselMax} = await response.json() //message, errors
            dispatch(setContent({
                ...getState().content, 
                carousel: {
                    images: result.carousel.images
                } 
            }))
            dispatch(setLoadContent({...successFetch}))
        } catch (e) {  
            fetchError({ 
                e,
                dispatch,
                setter: setLoadContent,
                controller,
                comp: {en: 'loading content', ru: 'загрузки контента'}
            })            
        }
    }
}


