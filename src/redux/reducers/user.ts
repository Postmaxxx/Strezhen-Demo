import { IAction, ICartItem, ICartState, IFetch, IUserState } from "../../interfaces"
import initialUserState from '../initialStates/user'
import { actionsListUser } from '../actions/actionsList'


type TActionListKeys = keyof typeof actionsListUser;


const reducerUser = (state:IUserState = initialUserState, action: {type: TActionListKeys, payload: unknown}): IUserState => {
    switch (action.type) {
        case actionsListUser.SET_USER as 'SET_USER': 
        const newProps = action.payload as Partial<IUserState>
            const newUser: IUserState = {...state}
            Object.keys(newProps).forEach(key => {
                newUser[key as keyof IUserState] = newProps[key as keyof IUserState] as never;
            })
            return newUser

        case actionsListUser.SET_USER_AUTH as 'SET_USER_AUTH': 
            const newUserAuth: IUserState = {
                ...state,
                auth: action.payload as IFetch
            }
            return newUserAuth

        case actionsListUser.SET_SEND_STATUS_ORDER as 'SET_SEND_STATUS_ORDER': 
            return {
                ...state, 
                sendOrder: action.payload as IFetch
            }

        case actionsListUser.SET_SEND_STATUS_CART as 'SET_SEND_STATUS_CART': 
            return {
                ...state, 
                cart: {
                    ...state.cart,
                    send:  action.payload as IFetch
                }

            }
        case actionsListUser.SET_LOAD_STATUS_CART as 'SET_LOAD_STATUS_CART': 
            return {
                ...state, 
                cart: {
                    ...state.cart,
                    load: action.payload as IFetch
                }

            }



        case actionsListUser.SET_CART as 'SET_CART':
            return {
                ...state, 
                cart: {
                    ...state.cart,
                    ...action.payload as Partial<ICartState>
                }
            }


        case actionsListUser.ADD_ITEM_CART as 'ADD_ITEM_CART': 
            const newItem = action.payload as ICartItem
            let itemInCart: boolean = false;
            const newItems: ICartItem[] = state.cart.items.map(item => {
                let itemTheSame = true
                if (item.color !== newItem.color) {itemTheSame = false}
                if (item.fiber !== newItem.fiber) {itemTheSame = false}
                if (item.product._id !== newItem.product._id) {itemTheSame = false}
                if (item.type.en !== newItem.type.en) {itemTheSame = false}

                if (!itemTheSame) return item
                itemInCart = true
                
                return {...item, amount: item.amount + newItem.amount }
            })
            !itemInCart && newItems.push(newItem)
            return {
                ...state, 
                cart: {
                    ...state.cart,
                    items:  newItems
                }
            } 

        case actionsListUser.CHANGE_AMOUNT_CART as 'CHANGE_AMOUNT_CART':
            const itemToChange = action.payload as ICartItem;
            const changedItems = state.cart.items.map(item =>  
                itemToChange.product._id === item.product._id && 
                itemToChange.fiber === item.fiber &&
                itemToChange.color === item.color &&
                itemToChange.type.en === item.type.en &&
                itemToChange.type.ru === item.type.ru ? itemToChange : item
            )
            return {
                ...state, 
                cart: {
                    ...state.cart,
                    items:  changedItems
                }
                
            } 

        case actionsListUser.REMOVE_ITEM_CART as 'REMOVE_ITEM_CART':
            const itemId = action.payload as ICartItem
            return {
                ...state, 
                cart: {
                    ...state.cart,
                    items:  state.cart.items.filter(item => itemId !== item)
                }
            } 

        default: {
			const missedSomeActions:never = action.type;
			return {
				...state   
			};
        }
    }
}

export default reducerUser