import { ICartState, IColor, IFiber, IFullState, IProduct, TLang, TLangText } from '../../interfaces';
import './add-to-cart.scss'
import { useState, useCallback } from "react";
import { AnyAction, bindActionCreators } from "redux";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import AmountChanger from '../AmountChanger/AmountChanger';
import { allActions } from "../../redux/actions/all";
import { errorsChecker } from '../../../src/assets/js/processors';
import { useMemo } from 'react'
import { IModalFunctions } from '../Modal/ModalNew';
import MessageNew from '../Message/MessageNew';
import { useNavigate } from 'react-router-dom';

interface IPropsState {
    cart: ICartState
    lang: TLang
    modal: IModalFunctions | null
}

interface IParentProps {
    data: {
        type: TLangText
        fiber: IFiber['_id'] | undefined
        color: IColor['_id']
        product: IProduct        
    }
}

export interface IAddToCart {
}

interface IPropsActions {
    setState: {
		user: typeof allActions.user
    }
}


interface IProps extends IPropsState, IParentProps, IPropsActions {}



const AddToCart: React.FC<IProps> = ({data, lang, cart, modal, setState}): JSX.Element => {
    const navigate = useNavigate()
    const [amount, setAmount] = useState<number>(1)
    const [amountChangerReset, setAmountChangerReset] = useState<{amount: number}>({amount: 1})
    const errChecker = useMemo(() => errorsChecker({lang}), [lang])

    const closeModal = useCallback(() => {
        modal?.closeCurrent()
        errChecker.clear() 
	}, [])
     
        
    const addToCart = () => { 
        !data.color && errChecker.add(lang === 'en' ? 'Please choose the color' : 'Пожалуйста, выберите цвет');
        !data.fiber && errChecker.add(lang === 'en' ? 'Please choose the fiber' : 'Пожалуйста, выберите материал');
        (data.type?.en === '') && errChecker.add(lang === 'en' ? 'Please choose the type' : 'Пожалуйста, выберите тип');
        !amount && errChecker.add(lang === 'en' ? 'Please set the amount' : 'Пожалуйста, укажите количество')

        if (errChecker.amount() > 0) {
            modal?.openModal({ //if error/success - show modal about send order
                name: 'cartAddError',
                onClose: closeModal,
                children: <MessageNew {...errChecker.result()} buttonClose={{action: closeModal, text: 'Close'}}/>
            })
            return
        }

        setState.user.addItem({
            amount, 
            product: data.product, 
            fiber: data.fiber as string, 
            color: data.color,
            type: data.type, 
        })

        setAmountChangerReset({amount: 1})
        const amountItemsInCart = cart.items.reduce((total, item) => total + item.amount, 0) + amount
        modal?.openModal({ //if error/success - show modal about send order
            name: 'cartAdder',
            onClose: closeModal,
            children: <MessageNew 
                status={'success'}
                header={lang === 'en' ? 'Added' : 'Добавлено'}
                text={lang === 'en' ? [`This item has been added to your сart.`, `You now have ${amountItemsInCart} item${amountItemsInCart > 1 ? 's' : ''} in your сart`, ] : [`Этот товар был успешно добавлен в Вашу корзину.`, `Сейчас у Вас товаров в корзине: ${amountItemsInCart}`, ]}
                buttonClose={{action: closeModal, text: lang === 'en' ? 'Close' : 'Закрыть  '}}
                buttonAdd={{action: () => {closeModal(); navigate('/order')}, text: lang === 'en' ? 'Go to cart' : 'Перейти в корзину'}}
                />
        })

    }


    const onAmountChange = useCallback((_id: IProduct['_id'], amount: number) => {
        setAmount(amount)
    }, [])


    return (
        <>
            <div className="cart-adder">
                <span>{lang === 'en' ? 'Amount' : 'Количество'}: </span>
                <div className="amount-changer-wrapper">
                    <AmountChanger<IProduct['_id']> idInstance={data.product._id} initialAmount={amount} reset={amountChangerReset} lang={lang} onChange={onAmountChange} />
                </div>
                <button className='button_blue button_add-cart' title='Add to cart' onClick={addToCart}>{lang === 'en' ? 'Add to cart' : 'В корзину'}</button>
            </div>
        </>
    )
}

const mapStateToProps = (state: IFullState): IPropsState => ({
    cart: state.user.cart,
    lang: state.base.lang,
    modal: state.base.modal.current
})


const mapDispatchToProps = (dispatch: Dispatch<AnyAction>): IPropsActions => ({
    setState: {
		user: bindActionCreators(allActions.user, dispatch),
	}
})
  
  

export default connect(mapStateToProps, mapDispatchToProps)(AddToCart);