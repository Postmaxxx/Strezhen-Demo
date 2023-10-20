import { IAction, IFetch, IFiber, IFibersState } from "../../interfaces"
import initialFibersState from '../initialStates/fibers'
import { actionsListFibers } from '../actions/actionsList'

type TActionListKeys = keyof typeof actionsListFibers;



const reducerFibers = (state:IFibersState = initialFibersState, action: {type: TActionListKeys, payload: unknown}): IFibersState => {
    switch (action.type) {
        case actionsListFibers.SET_LOAD_STATUS_FIBERS as 'SET_LOAD_STATUS_FIBERS': 
            return {
                ...state, 
                load: action.payload as IFetch
            }
        case actionsListFibers.SET_SEND_STATUS_FIBERS as 'SET_SEND_STATUS_FIBERS': 
            return {
                ...state, 
                send: action.payload as IFetch
            }
        case actionsListFibers.SET_DATA_FIBERS as 'SET_DATA_FIBERS': 
            return {
                ...state, 
                fibersList: [...action.payload as IFiber[]]
            }
        case actionsListFibers.SET_SELECTED_FIBER as 'SET_SELECTED_FIBER': 
            return {
                ...state, 
                selected: action.payload as string
            }
        default: {
			const missedSomeActions:never = action.type;
			return {
				...state   
			};
        }
    }
}

export default reducerFibers