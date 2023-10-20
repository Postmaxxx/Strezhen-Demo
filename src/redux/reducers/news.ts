import { IAction, IFetch, INewsItem, INewsItemShort, INewsState } from "../../interfaces"
import initialNewsState from '../initialStates/news'
import { actionsListNews } from '../actions/actionsList'

type TActionListKeys = keyof typeof actionsListNews;



const reducerNews = (state:INewsState = initialNewsState, action: {type: TActionListKeys, payload: unknown}): INewsState => {
    switch (action.type) {
        case actionsListNews.SET_LOAD_STATUS_NEWS as 'SET_LOAD_STATUS_NEWS': 
            return {
                ...state, 
                load: action.payload as IFetch
            }
        case actionsListNews.SET_LOAD_STATUS_ONE_NEWS as 'SET_LOAD_STATUS_ONE_NEWS': 
            return {
                ...state, 
                loadOne: action.payload as IFetch
            }
        case actionsListNews.SET_SEND_STATUS_NEWS as 'SET_SEND_STATUS_NEWS': 
            return {
                ...state, 
                send: action.payload as IFetch
            }
        case actionsListNews.SET_DATA_NEWS as 'SET_DATA_NEWS': 
            return {
                ...state, 
                newsList: [...action.payload as INewsItem[]]
            }
        case actionsListNews.SET_DATA_ONE_NEWS as 'SET_DATA_ONE_NEWS': 
            return {
                ...state, 
                newsOne: {...action.payload as INewsItem}
            }
        case actionsListNews.SET_TOTAL_NEWS as 'SET_TOTAL_NEWS': 
            return {
                ...state, 
                total: action.payload as number
            }
        default: {
			const missedSomeActions:never = action.type;
			return {
				...state   
			};
        }
    }
}

export default reducerNews