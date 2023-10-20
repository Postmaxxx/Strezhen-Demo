import { IAction, IContentState, IFeature, IFetch } from "../../interfaces"
import initialContentState from '../initialStates/content'
import { actionsListContent } from '../actions/actionsList'


type TActionListKeys = keyof typeof actionsListContent;


const reducerContent = (state:IContentState = initialContentState, action: {type: TActionListKeys, payload: unknown}): IContentState => {
    switch (action.type) {
        case actionsListContent.SET_SEND_STATUS_CONTENT as 'SET_SEND_STATUS_CONTENT': 
            return {
                ...state, 
                send: action.payload as IFetch
            }
        case actionsListContent.SET_LOAD_STATUS_CONTENT as 'SET_LOAD_STATUS_CONTENT': 
            return {
                ...state, 
                load: action.payload as IFetch
            }
        case actionsListContent.SET_CONTENT as 'SET_CONTENT': 
            return {
                ...state, 
                ...action.payload as IContentState
            }
        default: {
			const missedSomeActions:never = action.type;
			return {
				...state   
			};
        }
    }
}

export default reducerContent