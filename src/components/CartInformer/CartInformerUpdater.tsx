import { connect } from "react-redux";
import './cart-informer-updater.scss'
import { ICartState, IFullState, TLang } from "../../interfaces";
import { useState, useEffect, useMemo } from 'react'
import { AnyAction, bindActionCreators } from "redux";
import { Dispatch } from "redux";
import { allActions } from "../../redux/actions/all";
import { debounce } from "../../../src/assets/js/processors";
import { debounceTime } from "../../../src/assets/js/consts";
import React from 'react'

interface IPropsState {
    cart: ICartState
    lang: TLang
}

interface IPropsActions {
    setState: {
        user: typeof allActions.user
    }
}


interface IProps extends IPropsState, IPropsActions {}


const CartInformerUpdater: React.FC<IProps> = ({cart, setState}): JSX.Element => {
    const [itemsInCart, setItemsInCart] = useState<number>(0)

    const debouncedCartUpdate = useMemo(() => debounce(setState.user.sendCart, debounceTime), [])

    useEffect(() => {
        if (cart.load.status === 'success') {
            setItemsInCart(cart.items.reduce((total, item) => total + item.amount, 0))
        }
        debouncedCartUpdate()
    }, [cart.items])




    return (
        <>
            {cart.load.status === 'success' && itemsInCart > 0 && 
                <span className="cart-informer">+{itemsInCart}</span>
            }
        </>
    )
}


const mapStateToProps = (state: IFullState): IPropsState => ({
    cart: state.user.cart,
    lang: state.base.lang
})


const mapDispatchToProps = (dispatch: Dispatch<AnyAction>):IPropsActions => ({
    setState: {
		user: bindActionCreators(allActions.user, dispatch),
	}
})
  
export default connect(mapStateToProps, mapDispatchToProps)(CartInformerUpdater)

