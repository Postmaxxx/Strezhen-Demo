import { IAction, IDispatch, IErrRes, IFetch, IFullState, IMsgRes, INewsItem, INewsItemShort,  ISendNewsItem, TTypeRequest } from "../../interfaces"
import { actionsListNews } from './actionsList'
import { APIList, DOMExceptions, fetchingFetch, successFetch } from "../../assets/js/consts";
import { fetchError, resErrorFiller } from "../../../src/assets/js/processors";



export const setLoadNews = <T extends IFetch>(payload: T):IAction<T> => ({
    type: actionsListNews.SET_LOAD_STATUS_NEWS,
    payload: payload
});

export const setLoadOneNews = <T extends IFetch>(payload: T):IAction<T> => ({
    type: actionsListNews.SET_LOAD_STATUS_ONE_NEWS,
    payload: payload
});


export const setSendNews = <T extends IFetch>(payload: T):IAction<T> => ({
    type: actionsListNews.SET_SEND_STATUS_NEWS,
    payload: payload
});


export const setDataNews = <T extends Array<INewsItemShort>>(payload: T):IAction<T> => ({
    type: actionsListNews.SET_DATA_NEWS,
    payload: payload
});


export const setDataOneNews = <T extends INewsItem>(payload: T):IAction<T> => ({
    type: actionsListNews.SET_DATA_ONE_NEWS,
    payload: payload
});

export const setTotalNews = <T extends number>(payload: T):IAction<T> => ({
    type: actionsListNews.SET_TOTAL_NEWS,
    payload: payload
});


export const loadSomeNews = ({from, amount} :{from: number, amount: number}) => {
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        getState().news.load.controller?.abort(DOMExceptions.byFetch)
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.news.getSome.timeout) //set time limit for fetch
        dispatch(setLoadNews({...fetchingFetch, controller}))  
        const news = getState().news
        try {
            const url = `${APIList.news.getSome.url}?` + new URLSearchParams({from: `${from}`, amount: `${amount}`})
            const response: Response = await fetch(url, {
                signal: controller.signal,
                method: APIList.news.getSome.method,
                headers: {
                    "Content-Type": 'application/json',
                },
            })
            clearTimeout(fetchTimeout)
            if (!response.ok) {
                const result: IErrRes = await response.json() //message, errors
                return dispatch(setLoadNews(resErrorFiller(result)))
            }
            const result: {news: INewsItemShort[], total: number} = await response.json()
            dispatch(setDataNews([...news.newsList, ...result.news.map(item => {
                return {                    
                    date: new Date(item.date),
                    _id: item._id,
                    header: item.header,
                    short: item.short,
                    images: item.images
                }
            })]))
            dispatch(setTotalNews(result.total))
            dispatch(setLoadNews({...successFetch}))
        } catch (e) {
            fetchError({ 
                e,
                dispatch,
                setter: setLoadNews,
                controller,
                comp: {en: 'Error loading news', ru: 'Ошибка загрузки новостей'}
            })
        }
    }
}





export const loadOneNews = (_id: string) => {
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        getState().news.loadOne.controller?.abort(DOMExceptions.byFetch)
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.news.getOne.timeout) //set time limit for fetch
        dispatch(setLoadOneNews({...fetchingFetch, controller}))  
        try {
            const url = `${APIList.news.getOne.url}?` + new URLSearchParams({_id})
            const response: Response = await fetch(url, {
                signal: controller.signal,
                method: APIList.news.getOne.method,
                headers: {
                    "Content-Type": 'application/json',
                },
            })
            if (!response.ok) {
                const result: IErrRes = await response.json()
                return dispatch(setLoadOneNews(resErrorFiller(result)))
            }
            
            clearTimeout(fetchTimeout)
            const result: {news: INewsItem} = await response.json()
            dispatch(setDataOneNews({
                    ...result.news,
                    date: new Date(result.news.date),
                    _id: result.news._id,
                    header: result.news.header,
                    short: result.news.short,
                    text: result.news.text,
                    images: result.news.images,
                    }
            ))
            dispatch(setLoadOneNews({...successFetch}))
        } catch (e) {
            fetchError({ 
                e,
                dispatch,
                setter: setLoadOneNews,
                controller,
                comp: {en: 'Error loading this news', ru: 'Ошибка загрузки этой новости'}
            })
        }
    }
}




export const sendNews = (newsItem: ISendNewsItem) => {
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        const typeOfRequest: TTypeRequest = newsItem._id ? 'update' : 'create'
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.news[typeOfRequest].timeout) //set time limit for fetch
        dispatch(setSendNews({...fetchingFetch, controller})) 
        const sendForm = new FormData()   
        const {files, ...newsToSend} = newsItem //exclude files from data
        sendForm.append('data', JSON.stringify(newsToSend))
        newsItem.files.forEach(item => { sendForm.append('files', item, item.name) })
        try {
            const response: Response = await fetch(APIList.news[typeOfRequest].url, {
                signal: controller.signal,
                method: APIList.news[typeOfRequest].method,
                headers: {
                    'enctype': "multipart/form-data",
                    'Authorization': `Bearer ${getState().user.token}`
                },
                body: sendForm
            })
            clearTimeout(fetchTimeout)
            if (!response.ok) {
                const result: IErrRes = await response.json() //message, errors
                return dispatch(setSendNews(resErrorFiller(result)))
            }
            const result: IMsgRes = await response.json() //message
            dispatch(setSendNews({...successFetch, message: result.message}))
        } catch (e) {  
            fetchError({ 
                e,
                dispatch,
                setter: setSendNews,
                controller,
                comp: {en: 'Error creating news', ru: 'Ошибка создания новости'}
            })         
        }
    }
}




export const deleteNews = (_id: string) => {
    return async function(dispatch: IDispatch, getState: () => IFullState)  {
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller?.abort(DOMExceptions.byTimeout), APIList.news.delete.timeout) //set time limit for fetch
        dispatch(setSendNews({...fetchingFetch, controller})) 
        try {
            const response: Response = await fetch(APIList.news.delete.url, {
                signal: controller.signal,
                method: APIList.news.delete.method,
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': `Bearer ${getState().user.token}`
                },
                body: JSON.stringify({_id})
            })
            clearTimeout(fetchTimeout)
            if (!response.ok) {
                const result: IErrRes = await response.json() //message, errors
                return dispatch(setSendNews(resErrorFiller(result)))
            }
            const result: IMsgRes = await response.json() //message
            dispatch(setSendNews({...successFetch, message: result.message}))
        } catch (e) {  
            fetchError({ 
                e,
                dispatch,
                setter: setSendNews,
                controller,
                comp: {en: 'Error deleting news', ru: 'Ошибка удаления новости'}
            })            
        }
    }
}



