import { IColorsState, IFiberParam, IFibersState, IFullState, ISendFiber, TLang } from '../../../interfaces';
import './fiber-creator.scss'
import { FC, Fragment, useRef, useMemo, useCallback } from "react";
import { connect } from "react-redux";
import { AnyAction, bindActionCreators } from "redux";
import { Dispatch } from "redux";
import { useEffect, useState } from "react";
import { allActions } from "../../../redux/actions/all";
import AddFiles, { IAddFilesFunctions } from '../../../components/AddFiles/AddFiles';
import Selector, { ISelectorFunctions } from '../../../components/Selector/Selector';
import { fibersProperties } from '../../../assets/data/fibersProperties';
import Preloader from '../../../components/Preloaders/Preloader';
//import { useNavigate } from 'react-router-dom';
import { defaultSelectItem, fiberEmpty, inputsProps, resetFetch, selector, statuses } from '../../../assets/js/consts';
import { deepCopy, errorsChecker, filesDownloader, focusMover, modalMessageCreator, prevent } from '../../../assets/js/processors';
import Picker, { IPickerFunctions } from '../../../components/Picker/Picker';
import Featurer, { IFeaturerFunctions } from '../../../components/Featurer/Featurer';
import { inputChecker } from '../../../../src/assets/js/processors';
import { IModalFunctions } from '../../../../src/components/Modal/ModalNew';
import MessageNew from '../../../../src/components/Message/MessageNew';
import Uploader from '../../../../src/components/Preloaders/Uploader';

interface IPropsState {
    lang: TLang
    fibersState: IFibersState
    colorsState: IColorsState
    isAdmin: boolean
    modal: IModalFunctions | null
}


interface IPropsActions {
    setState: {
        fibers: typeof allActions.fibers
        colors: typeof allActions.colors
    }
}


interface IProps extends IPropsState, IPropsActions {}


const FiberCreator: FC<IProps> = ({lang, fibersState, setState, isAdmin, modal, colorsState}): JSX.Element => {
    const colorPickerRef = useRef<IPickerFunctions>(null)
    const fiberPickerRef = useRef<IPickerFunctions>(null)
    const addFilesRef = useRef<IAddFilesFunctions>(null)
    const _pros = useRef<HTMLDivElement>(null)
    const _cons = useRef<HTMLDivElement>(null)
    const _spec = useRef<HTMLDivElement>(null)
    const _descr = useRef<HTMLDivElement>(null)
    const prosRef = useRef<IFeaturerFunctions>(null)
    const consRef = useRef<IFeaturerFunctions>(null)
    const [fiber, setFiber] = useState<ISendFiber>(deepCopy(fiberEmpty))
    const focuserDescr = useMemo(() => focusMover(), [lang])
    const focuserSpec = useMemo(() => focusMover(), [lang])
    const focuserPros = useMemo(() => focusMover(), [lang])
    const focuserCons = useMemo(() => focusMover(), [lang])
    const selectorStatusRef = useRef<ISelectorFunctions>(null)

    const data10 = useMemo(() => selector["10"], [])
    const data5 = useMemo(() => selector["5"], [])
    const data3 = useMemo(() => selector["3"], [])
    const errChecker = useMemo(() => errorsChecker({lang}), [lang])
    const [submit, setSubmit] = useState<boolean>(false)
    const statusesList = useMemo(() => (Object.values(statuses)), []) 



    const closeModal = useCallback(async () => {
        if (await modal?.getName() === 'fiberSendStatus') {
            if (fibersState.send.status === 'success') {
                window.location.reload()
            }
            setState.fibers.setSendFibers(resetFetch)// clear fetch status
        }
        errChecker.clear() 
        modal?.closeCurrent()
	}, [fibersState.send.status, colorsState.send.status, errChecker])



    
    useEffect(() => {
        if (fibersState.send.status === 'success' || fibersState.send.status === 'error') {
            modal?.closeName('fiberSending');
            modal?.openModal({
                name: 'fiberSendStatus',
                onClose: closeModal,
                children: <MessageNew {...modalMessageCreator(fibersState.send, lang)} buttonClose={{action: closeModal, text: 'Close'}}/>
            })
        }
        if (fibersState.send.status === 'fetching') {
            modal?.openModal({
                name: 'fiberSending',
                closable: false,
                onClose: closeModal,
                children: <Uploader text={lang === 'en' ? "Sending fiber, please wait..." : "Отправка материала, пожалуйста ждите..."}/>
            })
        }
    }, [fibersState.send.status])



    


    const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {        
        prevent(e)
        if (!prosRef.current|| !consRef.current || !_spec.current || !_descr.current || !_pros.current || !_cons.current 
            || !colorPickerRef.current) return
        //check DESCRIPTION
        focuserDescr.focusAll(); //run over all elements to get all errors
        const errorDescrFields = _descr.current.querySelectorAll('.incorrect-value')
        if (errorDescrFields?.length > 0) {
            errChecker.add(lang === 'en' ? 'Some fields in description are filled incorrectly' : 'Некоторые поля в описании заполнены неправильно')
        }  
        //check Specifications
        focuserSpec.focusAll(); //run over all elements to get all errors
        const errorSpecFields = _spec.current.querySelectorAll('.incorrect-value')
        if (errorSpecFields?.length > 0) {
            errChecker.add(lang === 'en' ? 'Some fields in specifications are filled incorrectly' : 'Некоторые поля в параметрах заполнены неправильно')
        }  
        const allSpec = {} as IFiberParam; //create {} with all specs
        _spec.current.querySelectorAll('input, select')?.forEach(item => {     
            allSpec[item.id] = (item as HTMLInputElement | HTMLSelectElement).value 
        })
        //check Pros
        focuserPros.focusAll(); //run over all elements to get all errors
        const errorProsFields = _pros.current.querySelectorAll('.incorrect-value') 
        if (errorProsFields?.length > 0) {
            errChecker.add(lang === 'en' ? 'Some fields in pros are filled incorrectly' : 'Некоторые поля в плюсах заполнены неправильно')
        }  
        //check Cons
        focuserCons.focusAll(); //run over all elements to get all errors
        const errorConsFields = _cons.current.querySelectorAll('.incorrect-value')
        if (errorConsFields?.length > 0) {
            errChecker.add(lang === 'en' ? 'Some fields in cons are filled incorrectly' : 'Некоторые поля в минусах заполнены неправильно')
        }  
        //check Images
        if (addFilesRef.current && addFilesRef.current.getFiles().length === 0) {//check images
            errChecker.add(lang === 'en' ? 'Images missed' : 'Картинки отсутствуют')
        }
        //check Colors
        if (colorPickerRef.current.getSelected().length === 0) { //at least 1 color must be selected
            errChecker.add(lang === 'en' ? 'No colors selected' : 'Цвета не выбраны')
        }
        
        if (errChecker.amount() > 0) {
            modal?.openModal({
                name: 'errorChecker',
                onClose: closeModal,
                children: <MessageNew {...errChecker.result()} buttonClose={{action: closeModal, text: 'Close'}}/>
            })
            return
        }

        setFiber(prev => ({ 
                ...prev,
                _id: fiberPickerRef.current?.getSelected()[0] || '',
                params: allSpec,
                colors: (colorPickerRef.current as IPickerFunctions).getSelected(),
                files: addFilesRef.current?.getFiles() || [],
                proscons : {
                    pros: (prosRef.current as IFeaturerFunctions).getFeatures().map(item => ({en: item.name.en, ru: item.name.ru})),
                    cons: (consRef.current as IFeaturerFunctions).getFeatures().map(item => ({en: item.name.en, ru: item.name.ru}))
                },
                active: selectorStatusRef.current?.getValue() === 'active' ? true : false
            })
        )
        setSubmit(true)     
    }

    useEffect(() => {
        if (!submit || !fiberPickerRef.current) return
        setState.fibers.sendFiber(fiber)
        setSubmit(false)
    }, [submit])

    
    useEffect(() => { //get last version of colors
        setState.colors.loadColors()
    }, [isAdmin])




    const isChangeEvent = (e: any): e is React.ChangeEvent<HTMLInputElement> => {
        return (e as React.ChangeEvent<HTMLInputElement>).target !== undefined;
    }

    const onChangeInputs = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | React.MouseEvent<HTMLSelectElement>) => {
        (e.target as HTMLElement).parentElement?.classList.remove('incorrect-value') 
        if (isChangeEvent(e)) {
            e.target.id === "name_en" && setFiber(prev => ({...prev, name: {...prev.name, en: e.target.value}}))
            e.target.id === "name_ru" && setFiber(prev => ({...prev, name: {...prev.name, ru: e.target.value}}))
            e.target.id === "text_en" && setFiber(prev => ({...prev, text: {...prev.text, en: e.target.value}}))
            e.target.id === "text_ru" && setFiber(prev => ({...prev, text: {...prev.text, ru: e.target.value}}))
            e.target.id === "name_short_en" && setFiber(prev => ({...prev, short: {...prev.short, name: {...prev.short.name, en: e.target.value}}}))
            e.target.id === "name_short_ru" && setFiber(prev => ({...prev, short: {...prev.short, name: {...prev.short.name, ru: e.target.value}}}))
            e.target.id === "text_short_en" && setFiber(prev => ({...prev, short: {...prev.short, text: {...prev.short.text, en: e.target.value}}}))
            e.target.id === "text_short_ru" && setFiber(prev => ({...prev, short: {...prev.short, text: {...prev.short.text, ru: e.target.value}}}))
        }
    }, [])



    const renderSpec = useMemo(() => {
        return (
            fibersProperties.map((item, i) => {
                return (
                    <Fragment key={item._id}>
                        {item.type !== 'string' ? 
                            <Fragment key={item._id}>
                                <Selector 
                                    lang={lang} 
                                    id={item._id} 
                                    label={item.name}
                                    data={item.type === '10' ? data10 : item.type === '5' ? data5 : data3 }
                                    onBlur={(e) => inputChecker({lang, notExact: '', el: e.target})}/>
                            </Fragment>
                        :
                            <div key={item._id} className='block_input' data-selector="input-block">
                                <label htmlFor={item._id}>{item.name[lang]}, ({item.unit[lang]}):</label>
                                <input 
                                    data-selector="input"
                                    type="text" 
                                    id={item._id} 
                                    data-ru={item.name.ru} 
                                    data-en={item.name.en}
                                    onKeyDown={focuserSpec.next}
                                    onChange={onChangeInputs}
                                    onBlur={(e) => inputChecker({lang, min:1, max:50, el: e.target})}/>
                            </div>
                        }
                    </Fragment>
                )
            })
        )
    }, [fibersProperties, lang])

   


    useEffect(() => {
        if (!_spec.current || !_descr.current) return
        focuserDescr.create({container: _descr.current})
        focuserSpec.create({container: _spec.current, itemsSelector: '[data-selector="select"], [data-selector="input"]'})
        onChangeFeaturesAmount()
    }, [lang])



    const onChangeFeaturesAmount = useCallback(() => {  //select all inputs if new pro/con was added/ old one was removed  
        if (!_pros.current || !_cons.current) return
        focuserPros.create({container: _pros.current})
        const allInputsPros = _pros.current.querySelectorAll('[data-selector="input"]')
        allInputsPros?.forEach(input => {
            (input as HTMLInputElement).onblur = (e) => inputChecker({lang, min: inputsProps.fiber.proscons.min, max: inputsProps.fiber.proscons.max, el: e.target as HTMLInputElement});
        })
        focuserCons.create({container: _cons.current})
        const allInputsCons = _cons.current.querySelectorAll('[data-selector="input"]')
        allInputsCons?.forEach(input => {
            (input as HTMLInputElement).onblur = (e) => inputChecker({lang, min: inputsProps.fiber.proscons.min, max: inputsProps.fiber.proscons.max, el: e.target as HTMLInputElement});
        })
    }, [])



    const onChangeFeature = useCallback((target: HTMLInputElement | HTMLTextAreaElement) => {       
        target.parentElement?.classList.remove('incorrect-value') 
    }, [])



    const fillValues = async (_id: string) => {//fill values based on selected color
        if (!_spec.current || !prosRef.current || !consRef.current || !selectorStatusRef.current) return
        const selectedFiber = fibersState.fibersList.find(item => item._id === _id)
        if (selectedFiber) { //fiber exists
            //specifications
            _spec.current.querySelectorAll('input, select')?.forEach(item => {
                (item as HTMLInputElement | HTMLSelectElement).value = String(selectedFiber.params[item.id] || '')
            })
            //proscons
            prosRef.current.setFeatures(selectedFiber.proscons.pros.map(item => ({name: item, _id: ''}))) //Ids doesn't matter for fiber, pros/cons are just arrays
            consRef.current.setFeatures(selectedFiber.proscons.cons.map(item => ({name: item, _id: ''}))) //Ids doesn't matter for fiber, pros/cons are just arrays
            //colors 
            colorPickerRef.current?.setSelected(selectedFiber.colors)
            //files
            const files = await filesDownloader(
                selectedFiber.images.files.map(file => (`${selectedFiber.images.basePath}/${selectedFiber.images.sizes[selectedFiber.images.sizes.length - 1].subFolder}/${file}`))
            )
            addFilesRef.current?.replaceFiles(files)
            setFiber({...selectedFiber, files}) // +descr part
            selectorStatusRef.current.setValue(selectedFiber.active ? statuses.active.value : statuses.suspended.value)
        } else { //new fiber
            //specifications
            _spec.current.querySelectorAll('input, select')?.forEach(item => {
                (item as HTMLInputElement | HTMLSelectElement).value = ''
            })
            //proscons
            prosRef.current.setFeatures([]) //Ids doesn't matter for fiber, pros/cons are just arrays
            consRef.current.setFeatures([]) //Ids doesn't matter for fiber, pros/cons are just arrays
            //colors 
            colorPickerRef.current?.setSelected([])

            setFiber(deepCopy(fiberEmpty))
            addFilesRef.current?.clearAttachedFiles()
            selectorStatusRef.current.setItem({...defaultSelectItem})
            selectorStatusRef.current.setValue('')
            //selectorStatusRef.current.setValue(statuses.active.value)
        }
    }

    const onFiberSelected = (_id: string) => {
        fillValues(_id)
    }


    useEffect(() => {
        fibersState.load.status === 'success' && fiberPickerRef.current?.setSelected() 
    }, [fibersState.load.status])


    return (
        <div className="page page_creator_fiber">
            <div className="container_page">
                <div className="container">
                <h1>{lang === 'en' ? 'Edit fibers' : 'Изменение материалов'}</h1>
                    <form className='form_full form_add-fiber'>
                        <div className="block_text">
                            <h3>{lang === 'en' ? 'Select fiber to edit' : 'Выберите материал для редактирования'}</h3>           
                        </div>
                        {fibersState.load.status === 'success' ? 
                            <Picker 
                                type='fibers'
                                ref={fiberPickerRef} 
                                items={fibersState.fibersList} 
                                lang={lang} 
                                multiple={false}
                                withNew={true}
                                onItemClick={onFiberSelected}
                                minSelected={1}
                                markInactive={true}/>
                        :
                            <Preloader />}

                        <section className="fiber_descr" ref={_descr}>
                            <div className="block_text">
                                <h3>{lang === 'en' ? 'Fiber description' : 'Описание материала'}</h3>           
                            </div>
                            <div className="form__inputs form__inputs_sm-wide">
                                <div className="block_input" data-selector="input-block">
                                    <label htmlFor="name_short_en">{lang === 'en' ? 'Name short en' : 'Название кратко en'}</label>
                                    <input 
                                        data-selector="input"
                                        type="text" 
                                        id="name_short_en" 
                                        onChange={onChangeInputs} 
                                        onKeyDown={focuserDescr.next}
                                        value={fiber.short.name.en}
                                        onBlur={(e) => inputChecker({lang, min:inputsProps.fiber.nameShort.min, max:inputsProps.fiber.nameShort.max, el: e.target})}/>
                                </div>
                                <div className="block_input" data-selector="input-block">
                                    <label htmlFor="name_short_ru">{lang === 'en' ? 'Name short ru' : 'Название кратко ru'}</label>
                                    <input 
                                        data-selector="input"
                                        type="text" 
                                        id="name_short_ru" 
                                        onChange={onChangeInputs} 
                                        onKeyDown={focuserDescr.next}
                                        value={fiber.short.name.ru}
                                        onBlur={(e) => inputChecker({lang, min:inputsProps.fiber.nameShort.min, max:inputsProps.fiber.nameShort.max, el: e.target})}/>
                                </div>
                            </div>
                            <div className="form__inputs form__inputs_sm-wide">
                                <div className="block_input" data-selector="input-block">
                                    <label htmlFor="name_en">{lang === 'en' ? 'Name en' : 'Название en'}</label>
                                    <input 
                                        data-selector="input"
                                        type="text" 
                                        id="name_en" 
                                        onChange={onChangeInputs} 
                                        onKeyDown={focuserDescr.next}
                                        value={fiber.name.en}
                                        onBlur={(e) => inputChecker({lang, min:inputsProps.fiber.nameFull.min, max:inputsProps.fiber.nameFull.max, el: e.target})}/>
                                </div>
                                <div className="block_input" data-selector="input-block">
                                    <label htmlFor="name_ru">{lang === 'en' ? 'Name ru' : 'Название ru'}</label>
                                    <input 
                                        data-selector="input"
                                        type="text" 
                                        id="name_ru" 
                                        onChange={onChangeInputs} 
                                        onKeyDown={focuserDescr.next}
                                        value={fiber.name.ru}
                                        onBlur={(e) => inputChecker({lang, min:inputsProps.fiber.nameFull.min, max:inputsProps.fiber.nameFull.max, el: e.target})}/>
                                </div>
                            </div>
                            <div className="form__inputs form__inputs_sm-wide">
                                <div className="block_input" data-selector="input-block">
                                    <label htmlFor="text_short_en">{lang === 'en' ? 'Description short en' : 'Описание кратко en'}</label>
                                    <textarea 
                                        data-selector="input"
                                        id="text_short_en" 
                                        onChange={onChangeInputs}
                                        value={fiber.short.text.en}
                                        onBlur={(e) => inputChecker({lang, min:inputsProps.fiber.textShort.min, max:inputsProps.fiber.textShort.max, el: e.target})}/>
                                </div>
                                <div className="block_input" data-selector="input-block">
                                    <label htmlFor="text_short_ru">{lang === 'en' ? 'Description short ru' : 'Описание кратко ru'}</label>
                                    <textarea 
                                        data-selector="input"
                                        id="text_short_ru" 
                                        onChange={onChangeInputs} 
                                        value={fiber.short.text.ru}
                                        onBlur={(e) => inputChecker({lang, min:inputsProps.fiber.textShort.min, max:inputsProps.fiber.textShort.max, el: e.target})}/>
                                </div>
                            </div>
                            <div className="form__inputs form__inputs_sm-wide">
                                <div className="block_input" data-selector="input-block">
                                    <label htmlFor="text_en">{lang === 'en' ? 'Description en' : 'Описание en'}</label>
                                    <textarea 
                                        data-selector="input"
                                        id="text_en" 
                                        onChange={onChangeInputs} 
                                        value={fiber.text.en}
                                        onBlur={(e) => inputChecker({lang, min:inputsProps.fiber.textFull.min, max:inputsProps.fiber.textFull.max, el: e.target})}/>
                                </div>
                                <div className="block_input" data-selector="input-block">
                                    <label htmlFor="text_ru">{lang === 'en' ? 'Description ru' : 'Описание ru'}</label>
                                    <textarea 
                                        data-selector="input"
                                        id="text_ru"
                                        onChange={onChangeInputs}
                                        value={fiber.text.ru}
                                        onBlur={(e) => inputChecker({lang, min:inputsProps.fiber.textFull.min, max:inputsProps.fiber.textFull.max, el: e.target})}/>
                                </div>
                            </div>
                        </section>
                        <section className="fiber_specifications" ref={_spec}>
                            <div className="block_text">
                                <h3>{lang === 'en' ? 'Fiber specifications' : 'Характеристики материала'}</h3>           
                            </div>
                            <div className="block_inputs_3">
                                {renderSpec}
                                <Selector 
                                    lang={lang} 
                                    id='selector_status' 
                                    label={{en: 'Fiber status: ', ru: 'Состояние материала: '}}
                                    data={statusesList}
                                    onBlur={(e) => inputChecker({lang, notExact: '', el: e.target})}
                                    defaultData={{...defaultSelectItem}}
                                    saveValue={onChangeInputs}
                                    ref={selectorStatusRef}
                                />
                            </div>
                        </section>
                        <section className="fiber_pros" ref={_descr}>
                            <div className="block_text">
                                <h3>{lang === 'en' ? 'Fiber pros' : 'Плюсы материала'}</h3>           
                            </div>
                            <div className="fiber_pros" ref={_pros}>
                                <Featurer 
                                    lang={lang} 
                                    ref={prosRef}
                                    amountChanged={onChangeFeaturesAmount}
                                    valueChanged={onChangeFeature}
                                    onEnter={focuserPros.next}/>
                            </div>
                        </section>
                        <section className="fiber_cons" ref={_descr}>
                            <div className="block_text">
                                <h3>{lang === 'en' ? 'Fiber cons' : 'Минусы материала'}</h3>           
                            </div>
                            <div className="fiber_cons" ref={_cons}>
                                <Featurer 
                                    lang={lang} 
                                    ref={consRef}
                                    amountChanged={onChangeFeaturesAmount}
                                    valueChanged={onChangeFeature}
                                    onEnter={focuserCons.next}/>
                            </div>
                        </section>

                        <section className="fiber_colors" ref={_descr}>
                            <div className="block_text">
                                <h3>{lang === 'en' ? 'Select all applicable colors' : 'Выберите все применимые цвета'}</h3>           
                            </div>
                            {colorsState.load.status === 'success' ? 
                                <Picker 
                                    type='colors'
                                    ref={colorPickerRef} 
                                    items={colorsState.colors} 
                                    lang={lang}
                                    minSelected={1}
                                    markInactive={true}/>
                            :
                                <Preloader />}
                        </section>

                        <section className="fiber_images" ref={_descr}>
                            <div className="block_text">
                                <h3>{lang === 'en' ? 'Add images' : 'Выберите изображения'}</h3>           
                            </div>
                            <AddFiles lang={lang} ref={addFilesRef} multiple={true} id='allImages'/>
                        </section>

                        


                        <button className='button_blue button_post' disabled={fibersState.send.status === 'fetching'} onClick={onSubmit}>
                            {fiber._id ? lang === 'en' ? 'Save changes' : "Сохранить изменения" : lang === 'en' ? 'Create fiber' : 'Создать материал'}
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
    colorsState : state.colors,
    isAdmin: state.user.isAdmin,
    modal: state.base.modal.current
})


const mapDispatchToProps = (dispatch: Dispatch<AnyAction>):IPropsActions => ({
    setState: {
		fibers: bindActionCreators(allActions.fibers, dispatch),
		colors: bindActionCreators(allActions.colors, dispatch),
	}
})
  

    
export default connect(mapStateToProps, mapDispatchToProps)(FiberCreator)