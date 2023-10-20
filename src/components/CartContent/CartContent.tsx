import { AnyAction, bindActionCreators } from "redux";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import './cart-content.scss'
import { ICartItem, ICartState, IColor, IColorsState, IFibersState, IFullState, IProduct, TLang } from "../../interfaces";
import { useCallback, useMemo, Fragment, useEffect } from 'react'
import { NavLink } from "react-router-dom";
import Delete from "../Delete/Delete";
import AmountChanger from "../AmountChanger/AmountChanger";
import PreloaderW from "../Preloaders/PreloaderW";
import { allActions } from "../../redux/actions/all";
import ErrorMock from "../ErrorFetch/ErrorFetch";
import ImageModalNew from "../ImageModal/ImageModalNew";
import { IModalFunctions } from "../Modal/ModalNew";
import PicWithPreloader from "../../../src/assets/js/PicWithPreloader";
//import { debounce } from "../../../src/assets/js/processors";

interface IPropsState {
    lang: TLang,
    colorsState: IColorsState
    fibersState: IFibersState
    cart: ICartState
    modal: IModalFunctions | null
}

interface IPropsActions {
    setState: {
        fibers: typeof allActions.fibers
        catalog: typeof allActions.catalog
        colors: typeof allActions.colors
		user: typeof allActions.user
    }
}

interface IProps extends IPropsState, IPropsActions {}

const CartContent: React.FC<IProps> = ({lang, cart, colorsState, modal, fibersState, setState}): JSX.Element => {

    const deleteItem = useCallback((item: ICartItem) => {
        setState.user.removeItem(item)
    }, [])


    //const debouncedCartUpdate = debounce((newItem: ICartItem) => setState.user.updateCartItemAmount(newItem), 1000)


    const onAmountChange = useCallback((item: ICartItem, amount: number) => {
        setState.user.changeItem({...item, amount})
        //debouncedCartUpdate({...item, amount})
    }, [])


    /*useEffect(() => {
        return () => {
            setState.user.sendCart()
        }
    }, [])*/


    const onImageClick = (e: React.MouseEvent, product: IProduct) => {
        if (!product) return
        e.stopPropagation()
        const lastIndex = product.images.sizes.length - 1
        modal?.openModal({
            name: 'productClicked',
            children: <ImageModalNew url={`${product.images.basePath}/${product.images.sizes[lastIndex].subFolder}/${product.images.files[0]}`} text={product.name[lang]}/>
        })
    }
    
    const onColorClick = (e: React.MouseEvent | React.KeyboardEvent, color: IColor | undefined) => {
        if (!color) return
        e.stopPropagation()
        modal?.openModal({
            name: 'colorClicked',
            children: <ImageModalNew url={color.urls.full} />
        })
    }



    const cartContent = useMemo(() => {
        return cart.items.map((item, i) => {
            const fiberName = fibersState.fibersList.find(fiberItem => fiberItem._id === item.fiber)?.short.name[lang]
            const color: IColor | undefined = colorsState.colors.find(color => color._id === item.color)
            return (
                <Fragment  key={i}>
                    {color && fiberName &&
                        <div className="cart__item">
                            <div className="wrapper_img" onClick={(e) => onImageClick(e, item.product)}>
                                <PicWithPreloader basePath={item.product.images.basePath} sizes={item.product.images.sizes} image={item.product.images.files[0]} alt={item.product.name[lang]}/>
                            </div>
                
                            <div className="item__descriptions">
                                <div className="description">
                                    <span className="description__name">{lang === 'en' ? 'Product: ' : 'Товар: '} 
                                        <NavLink className="item__product-link" to={`../catalog/${item.product._id}`} target="_blank" rel="noopener noreferrer" aria-label={lang === 'en' ? 'Go to product' : 'Перейти к товару'}>
                                            {item.product.name[lang]}
                                        </NavLink>
                                    </span>
                                    {/*<span className="product">{item.product.name[lang]}</span>*/}
                                </div>
                                {item.type &&
                                    <div className="description">
                                        <span className="description__name">{lang === 'en' ? 'Type: ' : 'Модификация: '}
                                            <span className="fiber">{item.type[lang]}</span>
                                        </span>
                                    </div>
                                }
                                <div className="description">
                                    <span className="description__name">{lang === 'en' ? 'Fiber: ' : 'Материал: '}
                                        <span className="fiber">{fiberName}</span>
                                    </span>
                                </div>
                                <div className="description">
                                    <span className="description__name">{lang === 'en' ? 'Color' : 'Цвет'}:</span>
                                    <div className="color" onClick={(e) => onColorClick(e, color)} tabIndex={0} onKeyDown={e => {e.code === 'Enter' && onColorClick(e, color)}}> 
                                        <div className="wrapper_img">
                                            <img src={color.urls.thumb} alt={color.name[lang]} />
                                        </div>
                                        <span className="color__name">{color.name[lang]}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="item__remover">
                                <Delete<ICartItem> remove={deleteItem} idInstance={item} lang={lang} disabled={false}/>
                            </div>
                            <div className="amount-wrapper">
                                <AmountChanger<ICartItem> idInstance={item} initialAmount={item.amount} lang={lang} onChange={onAmountChange} />
                            </div>
                        </div>
                    }
                </Fragment>
            )
        })
    }, [cart.items, fibersState.fibersList, colorsState.colors])
        

    return (
        <div className="cart">
            {colorsState.load.status === 'success' && fibersState.load.status === 'success' &&  cart.load.status === 'success' &&
                cart.items.length > 0 ? 
                    <>{cartContent}</>
                : 
                    <h3 className="cart_empty__text">{lang === 'en' ? 'Your cart is empty' : 'Ваша корзина пуста'}</h3>
            }
            
            {cart.load.status === 'fetching' && <PreloaderW />}
            {cart.load.status === 'error' && <ErrorMock lang={lang} fetchData={cart.load}/>}
        </div>
    )
}


const mapStateToProps = (state: IFullState): IPropsState => ({
    cart: state.user.cart,
    lang: state.base.lang,
    colorsState: state.colors,
    fibersState: state.fibers,
    modal: state.base.modal.current
})


const mapDispatchToProps = (dispatch: Dispatch<AnyAction>):IPropsActions => ({
    setState: {
		fibers: bindActionCreators(allActions.fibers, dispatch),
		colors: bindActionCreators(allActions.colors, dispatch),
		catalog: bindActionCreators(allActions.catalog, dispatch),
		user: bindActionCreators(allActions.user, dispatch),
	}
})
  
export default connect(mapStateToProps, mapDispatchToProps)(CartContent);
