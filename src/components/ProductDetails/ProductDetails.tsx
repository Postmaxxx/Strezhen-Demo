import {  IColor, IColorsState, IFetch, IFiber, IFibersState, IFullState,  IMod,  IProduct, TLang, TLangText, } from '../../interfaces'
import './product-details.scss'
import { useRef, useEffect, useState, useMemo } from "react";
import { AnyAction, bindActionCreators } from "redux";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import AddToCart from '../AddToCart/AddToCart';
import { NavLink } from 'react-router-dom';
import { allActions } from "../../redux/actions/all";
import Selector, { IItem, ISelectorFunctions } from '../Selector/Selector';
import { inputChecker } from '../../../src/assets/js/processors';
import ColorSelector from '../ColorSelector/ColorSelector';
import { defaultSelectItem, empty } from '../../../src/assets/js/consts';
import { IModalFunctions } from '../Modal/ModalNew';
import { deepCopy } from '../../../src/assets/js/processors';

interface IPropsState {
	lang: TLang
	product: IProduct
    productLoad: IFetch
    colors: IColorsState
    fibers: IFibersState
    modal: IModalFunctions | null
    isAuth: boolean
}

interface IPropsActions {
    setState: {
        fibers: typeof allActions.fibers
        catalog: typeof allActions.catalog
        colors: typeof allActions.colors
    }
}

interface IProps extends IPropsState, IPropsActions {}



const ProductDetails: React.FC<IProps> = ({lang, product, colors,productLoad, modal, fibers, isAuth }): JSX.Element => {
    const [selectedType, setSelectedType] = useState<IMod>({name: deepCopy(empty), weight: -1})
    const [selectedFiber, setSelectedFiber] = useState<IFiber>()
    const [selectedColor, setSelectedColor] = useState<IColor["_id"]>('')
    const selectorTypeRef = useRef<ISelectorFunctions>(null)
    const selectorFiberRef = useRef<ISelectorFunctions>(null)
    
    const onChangeFiber: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
        setSelectedFiber(fibers.fibersList.find(fiber => fiber._id === e.target.value))
        setSelectedColor('')        
    }



    const onChangeType = (item: IItem) => {
        setSelectedType({name: item.name, weight: +item.value})           
    }



    const onSelectColor = (colorId: IColor["_id"]) => {
        setSelectedColor(colorId)
    }



    useEffect(() => {
        if (colors.load.status === 'success' && fibers.load.status === 'success' && productLoad.status === 'success') {
            const allFibers = product.fibers.map((productFiber) => {
                return fibers.fibersList.find(fiberItem => fiberItem._id === productFiber)
            }).map(item => ({_id: item?._id, short: {name: item?.short.name}})) as IFiber[]

            selectorTypeRef.current?.setData(product.mods.map(mod => ({value: String(mod.weight), name: mod.name})))
            selectorFiberRef.current?.setData(allFibers.map(fiber => ({value: fiber._id, name: fiber.short.name})))
        }
    },[fibers.load.status, colors.load.status, productLoad.status])
       

    //const productDescr = product.text[lang].split('\n').map((text, i) => <p key={i}>{text}</p>)
   

    const dataToCart = 
        {
            fiber: selectedFiber?._id,
            color: selectedColor,
            product,
            type: selectedType.name
        }

    

    const colorsList = useMemo(() => {
        return colors.colors.filter(color => selectedFiber?.colors.includes(color._id))
    },[colors.colors, selectedFiber?.colors])

    return (
        <div className="product__info">
            <h3>{lang === 'en' ? 'Features' : 'Характеристики'}:</h3>
            <div className="features">
                <div className="feature text_simple">
                    <span>{lang === 'en' ? 'Description' : 'Описание'}: </span>
                    <p>{product.text[lang]}</p>
                </div>


                <div className="feature text_simple">
                    <span>{lang === 'en' ? 'Price' : 'Цена'}: </span>
                    <span>{(selectedType.weight === -1 || !selectedFiber?.params?.priceGr) ? 
                        lang === 'en' ? 'Select type and fiber' : 'Выберите версию и материал' : 
                        `${selectedType.weight * +selectedFiber.params.priceGr} ${lang === 'en' ? 'rub' : 'руб'}`}
                    </span>
                </div>

                
                <div className="feature wrap_xs">
                    <Selector 
                        lang={lang} 
                        id='selector_type' 
                        label={{en: 'Type: ', ru: 'Версия: '}}
                        onBlur={(e) => inputChecker({lang, notExact: '', el: e.target})}
                        defaultData={{...defaultSelectItem}}
                        ref={selectorTypeRef}
                        saveItem={onChangeType}/>
                </div>
                <div className="feature wrap_xs">
                    <Selector 
                        lang={lang} 
                        id='selector_fiber' 
                        label={{en: 'Fiber: ', ru: 'Материал: '}}
                        onBlur={(e) => inputChecker({lang, notExact: '', el: e.target})}
                        defaultData={{...defaultSelectItem}}
                        ref={selectorFiberRef}
                        saveValue={onChangeFiber}
                    />
                    {selectedFiber &&
                        <div className='fiber__link'>
                            <span className="link-spacer">.</span>
                            <NavLink 
                                to={`../../fibers/${selectedFiber._id}`} 
                                aria-label={lang === 'en' ? '(About selected fiber)' : ' (О выбранном материале)'}>
                                    {lang === 'en' ? '(About)' : '(Подробнее)'}
                            </NavLink>
                        </div>
                    }
                </div>
                {selectedFiber &&
                    <div className="feature colors__container wrap_xs">
                        <ColorSelector lang={lang} colors={colorsList} onSelect={onSelectColor} modal={modal}/>
                    </div>
                }
                
            </div>
            {isAuth && <AddToCart data={{...dataToCart}} />}
        </div>
    )
}




const mapStateToProps = (state: IFullState): IPropsState => ({
    lang: state.base.lang,
	product: state.catalog.category.product,
    colors: state.colors,
    fibers: state.fibers,
    productLoad: state.catalog.category.loadProduct,
    modal: state.base.modal.current,
    isAuth: state.user.auth.status === 'success'
})


const mapDispatchToProps = (dispatch: Dispatch<AnyAction>):IPropsActions => ({
    setState: {
		fibers: bindActionCreators(allActions.fibers, dispatch),
		colors: bindActionCreators(allActions.colors, dispatch),
		catalog: bindActionCreators(allActions.catalog, dispatch),
	}
})
  
  

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetails);
