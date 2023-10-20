import { AnyAction, bindActionCreators } from "redux";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import './custom-order.scss'
import { IFetch, IFullState, TLang } from "../../interfaces";
import { useEffect, useRef, useCallback, useMemo } from 'react'
import AddFiles, { IAddFilesFunctions } from "../../components/AddFiles/AddFiles";
import { allActions } from "../../redux/actions/all";
import { inputsProps, resetFetch} from "../../assets/js/consts";
import { deepCopy, errorsChecker, focusMover, modalMessageCreator, prevent } from "../../assets/js/processors";
import { inputChecker } from '../../assets/js/processors';
import { IModalFunctions } from "../../components/Modal/ModalNew";
import MessageNew from "../../components/Message/MessageNew";
import Uploader from "../../../src/components/Preloaders/Uploader";

interface IPropsState {
    lang: TLang,
    sendOrder: IFetch
    modal: IModalFunctions | null
}

interface IPropsActions {
    setState: {
        user: typeof allActions.user
    }
}

interface IProps extends IPropsState, IPropsActions {}



const CustomOrder:React.FC<IProps> = ({lang, sendOrder, modal, setState}): JSX.Element => {
    const _message = useRef<HTMLTextAreaElement>(null)
    const addFilesRef = useRef<IAddFilesFunctions>(null)
    const _formOrder = useRef<HTMLFormElement>(null)

    const focuser = useMemo(() => focusMover(), [lang])
    const errChecker = useMemo(() => errorsChecker({lang}), [lang])



    const closeModal = useCallback(async () => {        
        if (await modal?.getName() === 'sendOrder') {
            if (sendOrder.status === 'success') {
                addFilesRef.current?.clearAttachedFiles()
            }
            setState.user.setSendOrder(deepCopy(resetFetch))
        }
        if (await modal?.getName() === 'errorsInForm') {
        }
        modal?.closeCurrent()
	}, [sendOrder.status])

 

    const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!_message.current ||  !modal || !addFilesRef.current || !_formOrder.current) return
        prevent(e)
        //check errors
        focuser.focusAll();//run over all elements to get all errors
        const errorFields = _formOrder.current.querySelectorAll('.incorrect-value')
        errorFields?.length > 0 &&  errChecker.add(lang === 'en' ? 'Order description is filled incorrectly' : 'Поле информация о заказе заполнено неправильно')
        if (errChecker.amount() > 0) { //show modal with error
            modal?.openModal({
                name: 'errorsInForm',
                onClose: closeModal,
                children: <MessageNew {...errChecker.result()} buttonClose={{action: closeModal, text: 'Close'}}/>
            })
            return
        }
        setState.user.sendOrder({
            message: _message.current.value,
            files: addFilesRef.current.getFiles(),
        })
    }


    useEffect(() => {
        if (sendOrder.status === 'success' || sendOrder.status === 'error') {
            modal?.closeName('orderSending');
            modal?.openModal({ //if error/success - show modal about send order
                name: 'orderSend',
                onClose: closeModal,
                children: <MessageNew {...modalMessageCreator(sendOrder, lang)} buttonClose={{action: closeModal, text: 'Close'}}/>
            })
        }
        if (sendOrder.status === 'fetching') {
            modal?.openModal({
                name: 'orderSending',
                closable: false,
                onClose: closeModal,
                children: <Uploader text={lang === 'en' ? "Sending order, please wait..." : "Отправка заказа, пожалуйста ждите..."}/>
            })
        }
    }, [sendOrder.status])


    useEffect(() => {
        if (!_formOrder.current) return
        focuser.create({container: _formOrder.current})
    }, [lang])




    const onChangeText: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
        (e.target as HTMLElement).parentElement?.classList.remove('incorrect-value') 
    }

    
    return (
        <div className="page_order">
            <div className='container_page'>
                <div className="container">
                    <div className="block_text">
                        <h1>{lang === 'en' ? 'Order custom 3D printing' : 'Заказать индивидуальную 3D печать'}</h1>
                    </div>
                    <form className="form_full form_order" ref={_formOrder} >
                        <div className="block_text">
                            <h3>{lang === 'en' ? 'Information about the order' : 'Информация о заказе'}</h3>
                        </div>
                        <div className="form__inputs">
                            <div className="form__inputs__texts">
                                <div className="block_input expandable" data-selector="input-block">
                                    <label htmlFor="message">
                                        {lang === 'en' ? 'Order description' : 'Описание заказа'}
                                    </label>
                                    <textarea 
                                        data-selector="input"
                                        className="input-element" 
                                        id="message" 
                                        ref={_message}
                                        onChange={onChangeText}
                                        onBlur={(e) => inputChecker({lang, min:0, max:inputsProps.message.max, el: e.target})}/>
                                </div>
                            </div>
                            <div className="form__inputs__files">
                                <div className="block_input files">
                                    <label htmlFor="files">{lang === 'en' ? 'Attach files' : 'Прикрепить файлы'}</label>
                                    <AddFiles lang={lang} ref={addFilesRef} multiple={true} id='files'/>
                                </div>
                            </div>
                        </div>
                        <button 
                            className="button_blue button_light button_order" 
                            type="submit" 
                            disabled={sendOrder.status === 'fetching'} 
                            onClick={onSubmit}>
                                {lang === 'en' ? 'Order' : "Заказать"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}



const mapStateToProps = (state: IFullState): IPropsState => ({
    lang: state.base.lang,
    sendOrder: state.user.sendOrder,
    modal: state.base.modal.current
})


const mapDispatchToProps = (dispatch: Dispatch<AnyAction>):IPropsActions => ({
    setState: {
		user: bindActionCreators(allActions.user, dispatch),
	}
})
  
    
export default connect(mapStateToProps, mapDispatchToProps)(CustomOrder)
