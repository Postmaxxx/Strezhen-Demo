import { IAction, IColor, IColorsState, IFetch } from "../../interfaces"
import initialColorsState from '../initialStates/colors'
import { actionsListColors } from '../actions/actionsList'

type TActionListKeys = keyof typeof actionsListColors;

const reducerColors = (state:IColorsState = initialColorsState, action: {type: TActionListKeys, payload: unknown}): IColorsState => {
    switch (action.type) {
        case actionsListColors.SET_LOAD_STATUS_COLORS as 'SET_LOAD_STATUS_COLORS': 
            return {
                ...state, 
                load: action.payload as IFetch
            }
        case actionsListColors.SET_SEND_STATUS_COLORS as 'SET_SEND_STATUS_COLORS': 
            return {
                ...state, 
                send: action.payload as IFetch
            }
        case actionsListColors.SET_DATA_COLORS as 'SET_DATA_COLORS': 
            return {
                ...state, 
                colors: action.payload as IColor[]
            }

        default: {
			const missedSomeActions:never = action.type;
			return {
				...state   
			};
        }
    }
}

export default reducerColors