import { ICatalog, IFullState, TLang } from '../../../interfaces';
import './catalog-creator.scss'
import { FC, useRef, useMemo, useCallback } from "react";
import { connect } from "react-redux";
import { AnyAction, bindActionCreators } from "redux";
import { Dispatch } from "redux";
import { useEffect,  } from "react";
import { allActions } from "../../../redux/actions/all";
import { inputsProps, resetFetch } from '../../../assets/js/consts';
import { errorsChecker, focusMover, modalMessageCreator, prevent } from '../../../assets/js/processors';
import Featurer, { IFeaturerFunctions } from '../../../components/Featurer/Featurer';
import { inputChecker } from '../../../../src/assets/js/processors';
import { IModalFunctions } from '../../../../src/components/Modal/ModalNew';
import MessageNew from '../../../../src/components/Message/MessageNew';
import Uploader from '../../../../src/components/Preloaders/Uploader';


interface IPropsState {
    lang: TLang
    catalog: ICatalog
    modal: IModalFunctions | null
}

interface IPropsActions {
    setState: {
        catalog: typeof allActions.catalog
    }
}

interface IProps extends IPropsState, IPropsActions {}


const CategoriesChanger: FC<IProps> = ({lang, setState, modal, catalog}): JSX.Element => {
    const errChecker = useMemo(() => errorsChecker({lang}), [lang])
    const featurerRef = useRef<IFeaturerFunctions>(null)
    const _catalog = useRef<HTMLDivElement>(null)
    const focuser = useMemo(() => focusMover(), [lang])
    
    const closeModal = useCallback(async () => {
        if (await modal?.getName() === 'catalogSend') {
            if (catalog.send.status === 'success') {
                setState.catalog.loadCatalog()
                errChecker.clear()        
            }
            setState.catalog.setSendCatalog(resetFetch)
        }
        errChecker.clear()
        modal?.closeCurrent()
	}, [catalog.send.status, errChecker])



    useEffect(() => { 
        if (catalog.send.status === 'success' || catalog.send.status === 'error') {
            modal?.closeName('catalogSending');
            modal?.openModal({ //if error/success - show modal about send order
                name: 'catalogSend',
                onClose: closeModal,
                children: <MessageNew {...modalMessageCreator(catalog.send, lang)} buttonClose={{action: closeModal, text: 'Close'}}/>
            })
        }
        if (catalog.send.status === 'fetching') {
            modal?.openModal({
                name: 'catalogSending',
                closable: false,
                onClose: closeModal,
                children: <Uploader text={lang === 'en' ? "Sending catalog, please wait..." : "Отправка каталога, пожалуйста ждите..."}/>
            })
        }
    }, [catalog.send.status])



    const onSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {        
        prevent(e)
        if (!featurerRef.current || !_catalog.current) return
        focuser.focusAll();//run over all elements to get all errors
        const errorFields = _catalog.current.querySelectorAll('.incorrect-value')
        if (errorFields?.length > 0) {
            errChecker.add(lang === 'en' ? 'Empty inputs exists' : 'Есть незаполненная поля')
        }
        if (errChecker.amount() > 0) {
            modal?.openModal({ //if error/success - show modal about send order
                name: 'errorChecker',
                onClose: closeModal,
                children: <MessageNew {...errChecker.result()} text={[lang === 'en' ? 'Some fields are empty' : 'Присутствуют пустые поля']} buttonClose={{action: closeModal, text: 'Close'}}/>
            })  
            return
        }
        setState.catalog.sendCatalog(featurerRef.current.getFeatures())        
    }


    const fillValues = () => {      
        if (!featurerRef.current) return
        featurerRef.current.setFeatures(catalog.list)
    }


    useEffect(() => {
        if (catalog.load.status !== 'success' && catalog.load.status  !== 'fetching') {
			setState.catalog.loadCatalog()
		}
        if (catalog.load.status === 'success') {
            fillValues()
        }
    }, [catalog.load.status])

    

    useEffect(() => {
        onChangeFeaturesAmount()
    }, [lang])


    const onChangeFeaturesAmount = () => {  //select all inputs if new feature was added/ old one was removed  
        if (!_catalog.current) return
        focuser.create({container: _catalog.current})
        const allInputs = _catalog.current.querySelectorAll('[data-selector="input"]')
        allInputs?.forEach(input => {
            (input as HTMLInputElement | HTMLTextAreaElement).onblur = (e) => inputChecker({lang, min:inputsProps.category.min, max:inputsProps.category.max, el: e.target as HTMLInputElement});
        })
    }


    const onChangeFeature = (target: HTMLInputElement | HTMLTextAreaElement) => {       
        target.parentElement?.classList.remove('incorrect-value') 
    }


    return (
        <div className="page page_creator_catalog">
            <div className="container_page">
                <div className="container">
                    <h1>{lang === 'en' ? 'Change categoies' : 'Изменение категорий'}</h1>
                    <form className='form_full form_add-color' >
                        <div className="block_text">
                            <h3 className='full-width'>{lang === 'en' ? 'List' : 'Список'}</h3>           
                        </div>
                        <div className="catalog" ref={_catalog}>
                            <Featurer 
                                lang={lang} 
                                ref={featurerRef} 
                                amountChanged={onChangeFeaturesAmount}
                                valueChanged={onChangeFeature}
                                onEnter={focuser.next}
                                type='textarea'/>
                        </div>

                        <button className='button_blue button_post' disabled={catalog.send.status === 'fetching'} onClick={onSubmit}>
                            {lang === 'en' ? 'Save list' : 'Сохранить список'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}



const mapStateToProps = (state: IFullState): IPropsState => ({
    lang: state.base.lang,
    catalog: state.catalog.catalog,
    modal: state.base.modal.current
})


const mapDispatchToProps = (dispatch: Dispatch<AnyAction>):IPropsActions => ({
    setState: {
		catalog: bindActionCreators(allActions.catalog, dispatch),
	}
})
  

    
export default connect(mapStateToProps, mapDispatchToProps)(CategoriesChanger)