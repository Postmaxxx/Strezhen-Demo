import { IContentState, IFullState, TLang } from '../../../interfaces';
import './content-creator.scss'
import { FC, useRef, useMemo, useCallback } from "react";
import { connect } from "react-redux";
import { AnyAction, bindActionCreators } from "redux";
import { Dispatch } from "redux";
import { useEffect } from "react";
import { allActions } from "../../../redux/actions/all";
import AddFiles, { IAddFilesFunctions } from '../../../components/AddFiles/AddFiles';
import { navList, resetFetch } from '../../../assets/js/consts';
import { deepCopy, errorsChecker, filesDownloader, modalMessageCreator, prevent } from '../../../assets/js/processors';
import { useNavigate } from 'react-router-dom';
import { IModalFunctions } from '../../../../src/components/Modal/ModalNew';
import MessageNew from '../../../../src/components/Message/MessageNew';
import Uploader from '../../../../src/components/Preloaders/Uploader';

interface IPropsState {
    lang: TLang
    content: IContentState
    modal: IModalFunctions | null
}


interface IPropsActions {
    setState: {
        content: typeof allActions.content
    }
}


interface IProps extends IPropsState, IPropsActions {}

const SpliderChanger: FC<IProps> = ({lang, content, modal, setState}): JSX.Element => {
    const navigate = useNavigate()
    const addFilesRef = useRef<IAddFilesFunctions>(null)
    const _form = useRef<HTMLFormElement>(null)

    const errChecker = useMemo(() => errorsChecker({lang}), [lang])



    const closeModal = useCallback(async () => {
        if (await modal?.getName() === 'contentSend') {
            if (content.send.status === 'success') {
                addFilesRef.current?.clearAttachedFiles()
                navigate(navList.home.to, { replace: true });
                setState.content.setSendContent(deepCopy(resetFetch))// clear fetch status
            }
            setState.content.setSendContent(deepCopy(resetFetch))// clear fetch status
        }
        errChecker.clear()
        modal?.closeCurrent()
	}, [content.send.status, errChecker])




    useEffect(() => {
        if (content.send.status === 'success' || content.send.status === 'error') {
            modal?.closeName('contentSending');
            modal?.openModal({
                name: 'contentSend',
                onClose: closeModal,
                children: <MessageNew {...modalMessageCreator(content.send, lang)} buttonClose={{action: closeModal, text: 'Close'}}/>
            })
        }
        if (content.send.status === 'fetching') {
            modal?.openModal({
                name: 'contentSending',
                closable: false,
                onClose: closeModal,
                children: <Uploader text={lang === 'en' ? "Sending content, please wait..." : "Отправка контента, пожалуйста ждите..."}/>
            })
        }

    }, [content.send.status])


    const fillValues = async () => {
        const files = await filesDownloader(
            content.carousel.images.files.map(file => (`${content.carousel.images.basePath}/${content.carousel.images.sizes[content.carousel.images.sizes.length - 1].subFolder}/${file}`))
        )
        addFilesRef.current?.replaceFiles(files)
    }

    useEffect(() => {
        if (content.load.status !== 'success' && content.load.status  !== 'fetching') {
			setState.content.loadCarousel()
		}
    }, [])


    useEffect(() => {
        fillValues()
    }, [content.load])



    const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        prevent(e)   
        if (!_form.current || !addFilesRef.current) return

        if (addFilesRef.current.getFiles().length < 5) {
            errChecker.add(lang === 'en' ? 'Should be at least 5 images' : 'Требуется не менее 5 изображений')
        }

        if (errChecker.amount() > 0) {
            modal?.openModal({
                name: 'errorChecker',
                onClose: closeModal,
                children: <MessageNew {...errChecker.result()} buttonClose={{action: closeModal, text: 'Close'}}/>
            })
            return
        }
        //if no errors
        setState.content.sendCarousel(addFilesRef.current.getFiles())
    }



    return (
        <div className="page page_creator_content">
            <div className="container_page">
                <div className="container">
                    <h1>{lang === 'en' ? 'Change content' : 'Изменение контента'}</h1> 
                    <form className='form_full form_content' ref={_form}>
                        <div className="block_text">
                            <h3 className='section-header full-width'>{lang === 'en' ? 'Carousel' : 'Карусель'}</h3>           
                        </div>
                        <div className="form__inputs">
                            <AddFiles lang={lang} ref={addFilesRef} multiple={true} id='allImages'/>
                        </div>
                        <button className='button_blue button_light button_post' disabled={content.send.status === 'fetching'} onClick={e => onSubmit(e)}>
                            {lang === 'en' ? 'Save splider' : "Сохранить галерею"}
                        </button>
                    </form>
                </div>
            </div>

        </div>
    )
}





const mapStateToProps = (state: IFullState): IPropsState => ({
    lang: state.base.lang,
    content: state.content,
    modal: state.base.modal.current
})


const mapDispatchToProps = (dispatch: Dispatch<AnyAction>):IPropsActions => ({
    setState: {
		content: bindActionCreators(allActions.content, dispatch),
	}
})
  

    
export default connect(mapStateToProps, mapDispatchToProps)(SpliderChanger)