import { ICatalogState, IFibersState, IFullState, ISendProduct, TLang } from '../../../interfaces';
import './product-creator.scss'
import { FC, useRef, useMemo, useCallback } from "react";
import { connect } from "react-redux";
import { AnyAction, bindActionCreators } from "redux";
import { Dispatch } from "redux";
import { useEffect, useState } from "react";
import { allActions } from "../../../redux/actions/all";
import AddFiles, { IAddFilesFunctions } from '../../../components/AddFiles/AddFiles';
import Preloader from '../../../components/Preloaders/Preloader';
import { defaultSelectItem, inputsProps, productEmpty, resetFetch, statuses } from '../../../assets/js/consts';
import { deepCopy, errorsChecker, filesDownloader, focusMover, modalMessageCreator, prevent } from '../../../assets/js/processors';
import Picker, { IPickerFunctions } from '../../../components/Picker/Picker';
import Selector, { ISelectorFunctions } from '../../../components/Selector/Selector';
import { inputChecker } from '../../../../src/assets/js/processors';
import { IModalFunctions } from '../../../../src/components/Modal/ModalNew';
import MessageNew from '../../../../src/components/Message/MessageNew';
import Mods, { IModsFunctions } from '../../../../src/components/Mods/Mods';
import Uploader from '../../../../src/components/Preloaders/Uploader';

interface IPropsState {
    lang: TLang
    fibersState: IFibersState
    catalogState: ICatalogState
    modal: IModalFunctions | null
}

interface IPropsActions {
    setState: {
        fibers: typeof allActions.fibers
        catalog: typeof allActions.catalog
    }
}

interface IProps extends IPropsState, IPropsActions {}



const ProductCreator: FC<IProps> = ({lang, fibersState, setState, modal, catalogState}): JSX.Element => {
    const fiberPickerRef = useRef<IPickerFunctions>(null)
    const productPickerRef = useRef<IPickerFunctions>(null)
    const addFilesRef = useRef<IAddFilesFunctions>(null)
    const modsRef = useRef<IModsFunctions>(null)
    const selectorCategoryRef = useRef<HTMLSelectElement>(null)
    const selectorNewCategoryRef = useRef<HTMLSelectElement>(null)
    const selectorStatusRef = useRef<ISelectorFunctions>(null)
    const [product, setProduct] = useState<ISendProduct>({...productEmpty})
    const [submit, setSubmit] = useState<boolean>(false)
    const focuser = useMemo(() => focusMover(), [lang])
    const _form = useRef<HTMLFormElement>(null)
    const _mods = useRef<HTMLDivElement>(null)
    
    const errChecker = useMemo(() => errorsChecker({lang}), [lang])
    const statusesList = useMemo(() => (Object.values(statuses)), []) 


    const closeModal = useCallback(async () => {
        if (await modal?.getName()  === 'productSend') {
            if (catalogState.category.sendProduct.status === 'success') {
                setState.catalog.loadCategory({ _id: catalogState.category._id })
            }
            setState.catalog.setSendProduct(resetFetch)// clear fetch status
        }
        errChecker.clear() 
        modal?.closeCurrent()
	}, [catalogState.category.sendProduct.status, errChecker])

    

    
    useEffect(() => {
        if (catalogState.category.sendProduct.status === 'success' || catalogState.category.sendProduct.status === 'error') {
            modal?.closeName('productSending');
            modal?.openModal({
                name: 'productSend',
                onClose: closeModal,
                children: <MessageNew {...modalMessageCreator(catalogState.category.sendProduct, lang)} buttonClose={{action: closeModal, text: 'Close'}}/>
            })
        }
        if (catalogState.category.sendProduct.status === 'fetching') {
            modal?.openModal({
                name: 'productSending',
                closable: false,
                onClose: closeModal,
                children: <Uploader text={lang === 'en' ? "Sending product, please wait..." : "Отправка товара, пожалуйста ждите..."}/>
            })
        }
    }, [catalogState.category.sendProduct.status])




    const onSubmit = (e: React.MouseEvent<HTMLButtonElement>) => { 
        prevent(e)
        if (!_mods.current || !fiberPickerRef.current || !_form.current) return
        //check form
        focuser.focusAll(); //run over all elements to get all errors
        const errorDescrFields = _form.current.querySelectorAll('.incorrect-value')
        if (errorDescrFields?.length > 0) {
            errChecker.add(lang === 'en' ? 'Some fields are filled incorrectly' : 'Некоторые поля заполнены неправильно')
        } 
        //check mods
        if ((modsRef.current as IModsFunctions).getMods().length === 0) {//at least 1 mod must be added
            errChecker.add(lang === 'en' ? 'Missing type' : 'Тип отсутствует')
        }
        //check fibers  
        if (fiberPickerRef.current.getSelected().length === 0) { //at least 1 fiber must be selected
            errChecker.add(lang === 'en' ? 'No fiber selected' : 'Материал не выбран')
        } 
        //check images
        if (addFilesRef.current && addFilesRef.current.getFiles().length === 0) {//at least 1 image must be added
            errChecker.add(lang === 'en' ? 'Images missing' : 'Картинки отсутствуют')
        }

        if (errChecker.amount() > 0) {
            modal?.openModal({
                name: 'errorChecker',
                onClose: closeModal,
                children: <MessageNew {...errChecker.result()} buttonClose={{action: closeModal, text: 'Close'}}/>
            })
            return
        }      

        setProduct(prev => {
            return { 
                ...prev, 
                mods: (modsRef.current as IModsFunctions).getMods().map(item => ({name: item.name, weight: item.weight})),
                files: addFilesRef.current?.getFiles() || [], 
                fibers: (fiberPickerRef.current as IPickerFunctions).getSelected(),
                active: selectorStatusRef.current?.getValue() === 'active' ? true : false,
                category: selectorNewCategoryRef.current?.value || 'already_checked_that_not_empty'
            }
        })
        setSubmit(true)
    }


    useEffect(() => {
        if (!submit) return
        setState.catalog.sendProduct(product)
        setSubmit(false)
    }, [submit])




    useEffect(() => {
        modsRef.current?.setMods(product.mods.map((item, i) => ({_id: String(i), name: item.name, weight: item.weight})))
    }, [product.mods])




    useEffect(() => { 
        if (catalogState.catalog.load.status !== 'success' && catalogState.catalog.load.status  !== 'fetching') {
			setState.catalog.loadCatalog()
		}
        productPickerRef.current?.setSelected()
    }, [])



    const onChangeInputs = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        e.target.id === "name_en" && setProduct({...product, name: {...product.name, en: e.target.value}})
        e.target.id === "name_ru" && setProduct({...product, name: {...product.name, ru: e.target.value}})
        //e.target.id === "price" && checkIfNumbers(e.target.value) && setProduct({...product, price: Number(e.target.value)}) //save as string, but check it while submiting
        e.target.id === "text_en" && setProduct({...product, text: {...product.text, en: e.target.value}})
        e.target.id === "text_ru" && setProduct({...product, text: {...product.text, ru: e.target.value}})
        e.target.id === "text_short_en" && setProduct({...product, text_short: {...product.text_short, en: e.target.value}})
        e.target.id === "text_short_ru" && setProduct({...product, text_short: {...product.text_short, ru: e.target.value}})
    }


    const onChangeCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setProduct({...product, category: e.target.value})
        setState.catalog.loadCategory({ _id: e.target.value})     
        productPickerRef.current?.getSelected()[0] && productPickerRef.current?.setSelected() //change values only if product was selected, not if product "new"
        selectorNewCategoryRef.current && (selectorNewCategoryRef.current.value = e.target.value)
    }


    useEffect(() => {
        if (!_form.current) return       
        focuser.create({container: _form.current, itemsSelector: '[data-selector="select"], [data-selector="input"]'})
        onChangeModsAmount()
    }, [lang])


    const onChangeModsAmount = useCallback(() => {  //select all inputs if new mod was added/ old one was removed  
        if (!_mods.current || !_form.current) return
        focuser.create({container: _form.current, itemsSelector: '[data-selector="select"], [data-selector="input"]'})
        const allInputsPros = _mods.current.querySelectorAll('[data-selector="input"]') 
        
        allInputsPros?.forEach(input => {
            if ((input as HTMLInputElement).name === 'weight') {
                (input as HTMLInputElement).onblur = (e) => inputChecker({lang, type: 'numbers', el: e.target as HTMLInputElement});
            } else {
                (input as HTMLInputElement).onblur = (e) => inputChecker({lang, min: inputsProps.product.mods.min, max: inputsProps.product.mods.max, el: e.target as HTMLInputElement});
            }
                        
        })
    }, [])


    const onChangeFeature = useCallback((target: HTMLInputElement | HTMLTextAreaElement) => {       
        target.parentElement?.classList.remove('incorrect-value') 
    }, [])



    const onProductSelected = (_id: string) => {
        if (_id) {
            setState.catalog.loadProduct(_id)
        } else {
            setProduct(deepCopy(productEmpty))
            addFilesRef.current?.replaceFiles([])
            fiberPickerRef.current?.setSelected([])
            selectorStatusRef.current?.setItem({...defaultSelectItem})
            selectorStatusRef.current?.setValue('')  
            selectorNewCategoryRef.current && (selectorNewCategoryRef.current.value = selectorCategoryRef.current?.value || '')
        }
    }


    const fillData = async () => {
        const files = await filesDownloader(
            catalogState.category.product.images.files.map(file => (`${catalogState.category.product.images.basePath}/${catalogState.category.product.images.sizes[catalogState.category.product.images.sizes.length - 1].subFolder}/${file}`))
        )
        addFilesRef.current?.replaceFiles(files)
        fiberPickerRef.current?.setSelected(catalogState.category.product.fibers)
        setProduct({...catalogState.category.product, files})
        selectorStatusRef.current?.setValue(catalogState.category.product.active ? statuses.active.value : statuses.suspended.value)
    }


    useEffect(() => {
        if (selectorCategoryRef.current?.value) {
            fillData()
        }
    }, [catalogState.category.product])


    return (
        <div className="page page_creator_fiber">
            <div className="container_page">
                <div className="container">
                    <h1>{lang === 'en' ? 'Edit products' : 'Редактирование товаров  '}</h1>
                    <form className='form_full form_add-fiber' ref={_form}>
                        <div className="block_text">
                            <h3>{lang === 'en' ? 'Select product category' : 'Выберите категорию товара'}</h3>           
                        </div>
                        <div className="form__inputs form__inputs_sm-wide">
                            <div className="block_input selector" data-selector="input-block">
                                <label htmlFor="selector_category">{lang === 'en' ? 'Category' : 'Категория'}:</label>
                                <select 
                                    data-selector="select"
                                    ref={selectorCategoryRef} 
                                    id="selector_category"
                                    defaultValue=''
                                    onChange={onChangeCategory} 
                                    onBlur={(e) => inputChecker({lang, notExact: '', el: e.target})}>
                                        <option key={-1} value='' disabled hidden>{lang === 'en' ? 'Select' : 'Выберите'}</option>
                                        {catalogState.catalog.list.map((el) => <option key={el._id} value={el._id}>{el.name[lang]}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="block_text">
                            <h3>{lang === 'en' ? 'Select product' : 'Выберите товар'}</h3>           
                        </div>
                        <div className="picker_product">
                            <Picker 
                                type='products'
                                ref={productPickerRef} 
                                items={selectorCategoryRef.current?.value ? catalogState.category.products : []} 
                                lang={lang} 
                                multiple={false}
                                withNew={true}
                                onItemClick={onProductSelected}
                                minSelected={1}
                                simulateClickOnSelect={true}
                                markInactive={true}/>
                        </div>

                        <div className="block_text">
                            <h3>{lang === 'en' ? 'Product description' : 'Описание товара'}</h3>           
                        </div>
                        <div className="form__inputs form__inputs_sm-wide">
                            <div className="block_input">
                                <label htmlFor="name_en">{lang === 'en' ? 'Name en' : 'Название en'}:</label>
                                <input 
                                    type="text" 
                                    data-selector="input"
                                    id="name_en" 
                                    onKeyDown={focuser.next} 
                                    onChange={onChangeInputs} 
                                    value={product.name.en}
                                    onBlur={(e) => inputChecker({lang, min:inputsProps.product.name.min, max:inputsProps.product.name.max, el: e.target})}/>
                            </div>
                            <div className="block_input">
                                <label htmlFor="name_ru">{lang === 'en' ? 'Name ru' : 'Название ru'}:</label>
                                <input 
                                    type="text" 
                                    data-selector="input"
                                    id="name_ru" 
                                    onKeyDown={focuser.next}
                                    onChange={onChangeInputs} 
                                    value={product.name.ru} 
                                    onBlur={(e) => inputChecker({lang, min:inputsProps.product.name.min, max:inputsProps.product.name.max, el: e.target})}/>
                            </div>
                        </div>
                        <div className="form__inputs form__inputs_sm-wide">
                            <div className="block_input">
                                <label htmlFor="text_short_en">{lang === 'en' ? 'Description short en' : 'Описание кратко en'}:</label>
                                <textarea 
                                    data-selector="input"
                                    id="text_short_en"
                                    onChange={onChangeInputs} 
                                    value={product.text_short.en} 
                                    onBlur={(e) => inputChecker({lang, min:inputsProps.product.textShort.min, max:inputsProps.product.textShort.max, el: e.target})}/>
                            </div>
                            <div className="block_input">
                                <label htmlFor="text_short_ru">{lang === 'en' ? 'Description short ru' : 'Описание кратко ru'}:</label>
                                <textarea 
                                    data-selector="input"
                                    id="text_short_ru" 
                                    onChange={onChangeInputs} 
                                    value={product.text_short.ru} 
                                    onBlur={(e) => inputChecker({lang, min:inputsProps.product.textShort.min, max:inputsProps.product.textShort.max, el: e.target})}/>
                            </div>
                        </div>
                        <div className="form__inputs form__inputs_sm-wide">
                            <div className="block_input">
                                <label htmlFor="text_en">{lang === 'en' ? 'Description en' : 'Описание en'}:</label>
                                <textarea 
                                    data-selector="input"
                                    id="text_en" 
                                    wrap='hard'
                                    onChange={onChangeInputs} 
                                    value={product.text.en} 
                                    onBlur={(e) => inputChecker({lang, min:inputsProps.product.textFull.min, max:inputsProps.product.textFull.max, el: e.target})}/>
                            </div>
                            <div className="block_input">
                                <label htmlFor="text_ru">{lang === 'en' ? 'Description ru' : 'Описание ru'}:</label>
                                <textarea 
                                    data-selector="input"
                                    id="text_ru"
                                    wrap='hard'
                                    onChange={onChangeInputs} 
                                    value={product.text.ru} 
                                    onBlur={(e) => inputChecker({lang, min:inputsProps.product.textFull.min, max:inputsProps.product.textFull.max, el: e.target})}/>
                            </div>
                        </div>
                        <div className="form__inputs form__inputs_sm-wide">
                            <div className="block_input selector" data-selector="input-block">
                            <label htmlFor="selector_new_category">{lang === 'en' ? 'Change category to' : 'Изменить категорию на'}:</label>
                            <select 
                                data-selector="select"
                                ref={selectorNewCategoryRef} 
                                id="selector_new_category"
                                defaultValue=''
                                //onChange={onChangeCategory} 
                                onBlur={(e) => inputChecker({lang, notExact: '', el: e.target})}>
                                    <option key={-1} value='' disabled hidden>{lang === 'en' ? 'Select' : 'Выберите'}</option>
                                    {catalogState.catalog.list.map((el) => <option key={el._id} value={el._id}>{el.name[lang]}</option>)}
                            </select>
                            </div>
                            <Selector 
                                lang={lang} 
                                id='selector_status' 
                                label={{en: 'Product status: ', ru: 'Состояние товара: '}}
                                data={statusesList}
                                onBlur={(e) => inputChecker({lang, notExact: '', el: e.target})}
                                defaultData={{...defaultSelectItem}}
                                saveValue={onChangeInputs}
                                ref={selectorStatusRef}
                            />
                        </div>

                        <div className="block_text">
                            <h3>{lang === 'en' ? 'Types' : 'Модификации'}</h3>           
                        </div>
                        <div className="product_mods" ref={_mods}>
                            <Mods 
                                lang={lang} 
                                ref={modsRef}
                                amountChanged={onChangeModsAmount}
                                valueChanged={onChangeFeature}
                                onEnter={focuser.next}/>
                        </div>

                        <div className="block_text">
                            <h3>{lang === 'en' ? 'Select applicable fibers' : 'Выберите подходящие материалы'}</h3>           
                        </div>
                        <div className="picker_fibers">
                            {fibersState.load.status === 'success' ? 
                                <Picker 
                                    type='fibers'
                                    ref={fiberPickerRef} 
                                    items={fibersState.fibersList} 
                                    lang={lang}
                                    minSelected={1}
                                    markInactive={true}/>
                            :
                                <Preloader />}
                        </div>

                        <div className="block_text">
                            <h3>{lang === 'en' ? 'Add images' : 'Выберите изображения'}</h3>           
                        </div>
                        <AddFiles lang={lang} ref={addFilesRef} multiple={true} id='allImages'/>

                        
                        <button className='button_blue button_post' disabled={catalogState.category.sendProduct.status === 'fetching'} onClick={onSubmit}>
                            {product._id ? lang === 'en' ? 'Save changes' : "Сохранить изменения" : lang === 'en' ? 'Create product' : 'Создать товар'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}


const mapStateToProps = (state: IFullState): IPropsState => ({
    lang: state.base.lang,
    fibersState: state.fibers,
    catalogState: state.catalog,
    modal: state.base.modal.current
})

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>):IPropsActions => ({
    setState: {
		fibers: bindActionCreators(allActions.fibers, dispatch),
		catalog: bindActionCreators(allActions.catalog, dispatch),
	}
})

    
export default connect(mapStateToProps, mapDispatchToProps)(ProductCreator)