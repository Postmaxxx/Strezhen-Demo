import { IFetch, IFullState, INewsItem, ISendNewsItem, TLang } from '../../../interfaces';
import './news-creator.scss'
import { FC, useRef, useMemo, useCallback } from "react";
import { connect } from "react-redux";
import { AnyAction, bindActionCreators } from "redux";
import { Dispatch } from "redux";
import { useEffect } from "react";
import { allActions } from "../../../redux/actions/all";
import AddFiles, { IAddFilesFunctions } from '../../../components/AddFiles/AddFiles';
import { inputsProps, navList, newsItemEmpty, resetFetch } from '../../../assets/js/consts';
import { errorsChecker, filesDownloader, focusMover, modalMessageCreator, prevent } from '../../../assets/js/processors';
import { useNavigate, useParams } from 'react-router-dom';
import { inputChecker } from '../../../../src/assets/js/processors';
import dayjs from 'dayjs';
import { IModalFunctions } from '../../../../src/components/Modal/ModalNew';
import MessageNew from '../../../../src/components/Message/MessageNew';
import Uploader from '../../../../src/components/Preloaders/Uploader';

interface IPropsState {
    lang: TLang
    send: IFetch
    newsOne: INewsItem
    loadOne: IFetch
    modal: IModalFunctions | null
}


interface IPropsActions {
    setState: {
        news: typeof allActions.news
    }
}


interface IProps extends IPropsState, IPropsActions {}


const NewsCreator: FC<IProps> = ({lang, send, newsOne, loadOne, modal, setState}): JSX.Element => {
    const paramNewsId = useParams().newsId || ''
    const navigate = useNavigate()
    const addFilesRef = useRef<IAddFilesFunctions>(null)
    const _form = useRef<HTMLFormElement>(null)
    const _headerEn = useRef<HTMLInputElement>(null)
    const _headerRu = useRef<HTMLInputElement>(null)
    const _textShortEn = useRef<HTMLTextAreaElement>(null)
    const _textShortRu = useRef<HTMLTextAreaElement>(null)
    const _textEn = useRef<HTMLTextAreaElement>(null)
    const _textRu = useRef<HTMLTextAreaElement>(null)
    const _date = useRef<HTMLInputElement>(null)
    
    const focuser = useMemo(() => focusMover(), [lang])
    const errChecker = useMemo(() => errorsChecker({lang}), [lang])

   
    const closeModal = useCallback(async () => {   
        if (await modal?.getName() === 'newsSend') {
            if (send.status === 'success') {
                navigate(navList.account.admin.news.to, { replace: true })
                fillValues({...newsItemEmpty})
            }
            setState.news.setSendNews({...resetFetch})
        }
        setState.news.setSendNews(resetFetch)// clear fetch status
        errChecker.clear()
        modal?.closeCurrent()
	}, [send.status, paramNewsId, errChecker, modal])




    useEffect(() => {
        if (send.status === 'success' || send.status === 'error') {
            modal?.closeName('newsSending');
            modal?.openModal({
                name: 'newsSend',
                onClose: closeModal,
                children: <MessageNew {...modalMessageCreator(send, lang)} buttonClose={{action: closeModal, text: 'Close'}}/>
            })
        }
        if (send.status === 'fetching') {
            modal?.openModal({
                name: 'newsSending',
                closable: false,
                onClose: closeModal,
                children: <Uploader text={lang === 'en' ? "Sending news, please wait..." : "Отправка новости, пожалуйста ждите..."}/>
            })
        }
    }, [send.status])



    useEffect(() => { 
        if (paramNewsId) {//if edit
            if (loadOne.status !== 'success' && loadOne.status  !== 'fetching') {
                setState.news.loadOneNews(paramNewsId)
            }
        } else { //if create
            setState.news.setDataOneNews({...newsItemEmpty})
            fillValues({...newsItemEmpty})
        }
        return () => {setState.news.setLoadOneNews(resetFetch)}
    }, [paramNewsId])


    useEffect(() => {
        if (loadOne.status === 'success') {
            fillValues(newsOne)           
        }
    }, [loadOne])

    

    const onChangeInputs = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        (e.target as HTMLElement).parentElement?.classList.remove('incorrect-value') 
    }




    
    const fillValues = async (news: INewsItem) => {//fill values based on selected color
        
        if (!_headerEn.current || !_headerRu.current || !_textShortEn.current || !_textShortRu.current || 
            !_textEn.current || !_textRu.current || !_date.current) return
        if (paramNewsId) { //news exists
            const files = await filesDownloader(
                news.images.files.map(file => (`${news.images.basePath}/${news.images.sizes[news.images.sizes.length - 1].subFolder}/${file}`))
            )
            addFilesRef.current?.replaceFiles(files)
        } else { //new news
            addFilesRef.current?.clearAttachedFiles()
        }
        
        _headerEn.current.value = news?.header?.en || ''
        _headerRu.current.value = news?.header?.ru || ''
        _textShortEn.current.value = news?.short?.en || ''
        _textShortRu.current.value = news?.short?.ru || ''
        _textEn.current.value = news?.text?.en || ''
        _textRu.current.value = news?.text?.ru || ''
        _date.current.value =  dayjs(news?.date || '').format('YYYY-MM-DD')
    }
    




    const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        prevent(e)   
        if (!_form.current || !_headerEn.current || !_headerRu.current || !_textShortEn.current || !_textShortRu.current || !_textEn.current ||
            !_textRu.current || !_date.current ) return
        focuser.focusAll(); //run over all elements to get all errors
        const errorFields = _form.current.querySelectorAll('.incorrect-value')
        if (errorFields?.length > 0) {
            errChecker.add(lang === 'en' ? 'Some fields are filled incorrectly' : 'Некоторые поля заполнены неправильно')
        }    
        if (addFilesRef.current?.getFiles().length === 0) {
            errChecker.add(lang === 'en' ? 'No images' : 'Нет изображений')
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
        const newsItem: ISendNewsItem = {
            _id: paramNewsId || '',
            header: {
                en: _headerEn.current.value,
                ru: _headerRu.current.value,
            },
            text: {
                en: _textEn.current.value,
                ru: _textRu.current.value,
            },
            short: {
                en: _textShortEn.current.value,
                ru: _textShortRu.current.value,
            },
            date: new Date(_date.current.value),
            files: addFilesRef.current?.getFiles() || []
        }
        setState.news.sendNews(newsItem)
    }




    useEffect(() => {       
        if (!_form.current) return
        focuser.create({container: _form.current})
    }, [lang])


    return (
        <div className="page page_creator_news">
            <div className="container_page">
                <div className="container">
                    {paramNewsId ? 
                        <h1>{lang === 'en' ? 'Edit news' : 'Редактирование новости'}</h1>
                    :
                        <h1>{lang === 'en' ? 'Post news' : 'Добавление новости'}</h1>
                    }
                    <form className='form_full form_add-news' ref={_form}>
                        <div className="block_text">
                            <h3>{lang === 'en' ? 'Add information' : 'Добавьте информацию'}</h3>
                        </div>
                        <div className="form__inputs form__inputs_sm-wide">
                            <div className="block_input" data-selector="input-block">
                                <label htmlFor="header_en">{lang === 'en' ? "Header en" : "Заголовок en"}</label>
                                <input 
                                    ref={_headerEn}
                                    data-selector="input"
                                    type="text" 
                                    id='header_en' 
                                    onChange={onChangeInputs}
                                    onKeyDown={focuser.next} 
                                    onBlur={(e) => inputChecker({lang, min:inputsProps.news.header.min, max:inputsProps.news.header.max, el: e.target})}/>
                            </div>
                            <div className="block_input" data-selector="input-block">
                                <label htmlFor="header_ru">{lang === 'en' ? "Header ru" : "Заголовок ru"}</label>
                                <input 
                                    ref={_headerRu}
                                    data-selector="input"
                                    type="text" 
                                    id='header_ru' 
                                    onChange={onChangeInputs} 
                                    onKeyDown={focuser.next}
                                    onBlur={(e) => inputChecker({lang, min:inputsProps.news.header.min, max:inputsProps.news.header.max, el: e.target})}/>
                            </div>
                        </div>

                        
                        <div className="form__inputs form__inputs_sm-wide">
                            <div className="block_input" data-selector="input-block">
                                <label htmlFor="text_short_en">{lang === 'en' ? 'Short text en' : 'Краткий текст en'}</label>
                                <textarea 
                                        ref={_textShortEn}
                                        data-selector="input"
                                        id='text_short_en' 
                                        onChange={onChangeInputs} 
                                        onBlur={(e) => inputChecker({lang, min:inputsProps.news.textShort.min, max:inputsProps.news.textShort.max, el: e.target})}/>
                            </div>
                            <div className="block_input" data-selector="input-block">
                                <label htmlFor="text_short_ru">{lang === 'en' ? 'Short text ru' : 'Краткий текст ru'}</label>
                                <textarea 
                                        ref={_textShortRu}
                                        data-selector="input"
                                        id='text_short_ru' 
                                        onChange={onChangeInputs} 
                                        onBlur={(e) => inputChecker({lang, min:inputsProps.news.textShort.min, max:inputsProps.news.textShort.max, el: e.target})}/>
                            </div>
                        </div>
                        <div className="form__inputs form__inputs_sm-wide">
                            <div className="block_input" data-selector="input-block">
                                <label htmlFor="text_en">{lang === 'en' ? 'Full text en' : 'Полный текст en'}</label>
                                <textarea 
                                    ref={_textEn}
                                    data-selector="input"
                                    id='text_en' 
                                    onChange={onChangeInputs} 
                                    onBlur={(e) => inputChecker({lang, min:inputsProps.news.textFull.min, max:inputsProps.news.textFull.max, el: e.target})}/>
                            </div>
                            <div className="block_input" data-selector="input-block">
                                <label htmlFor="text_ru">{lang === 'en' ? 'Full text ru' : 'Полный текст ru'}</label>
                                <textarea 
                                    ref={_textRu}
                                    data-selector="input"
                                    id='text_ru' 
                                    onChange={onChangeInputs} 
                                    onBlur={(e) => inputChecker({lang, min:inputsProps.news.textFull.min, max:inputsProps.news.textFull.max, el: e.target})}/>
                            </div>
                        </div>
                        <div className="form__inputs form__inputs_sm-wide">
                            <div className="block_input">
                                <label htmlFor='date'>{lang === 'en' ? 'Date' : 'Дата'}:</label>
                                    <input 
                                        ref={_date}
                                        data-selector="input"
                                        type="date" 
                                        id="date" 
                                        onChange={onChangeInputs} 
                                        onKeyDown={focuser.next}
                                        onBlur={(e) => inputChecker({lang, type: "date", el: e.target})}/>
                            </div>
                        </div>
                        <div className="block_text">
                            <h3>{lang === 'en' ? 'Add images' : 'Добавьте изображения'}</h3>
                        </div>
                        <div className="form__inputs">
                            <AddFiles lang={lang} ref={addFilesRef} multiple={true} id='newsImages'/>
                        </div>


                        <button className='button_blue button_light' disabled={send.status === 'fetching'} onClick={e => onSubmit(e)}>
                            {lang === 'en' ? paramNewsId ? 'Save news' : 'Post news' : paramNewsId ? "Сохранить новость" : "Отправить новость"}
                        </button>
                    </form>
                </div>
            </div>

        </div>
    )
}





const mapStateToProps = (state: IFullState): IPropsState => ({
    lang: state.base.lang,
    send: state.news.send,
    newsOne: state.news.newsOne,
    loadOne: state.news.loadOne,
    modal: state.base.modal.current
})


const mapDispatchToProps = (dispatch: Dispatch<AnyAction>):IPropsActions => ({
    setState: {
		news: bindActionCreators(allActions.news, dispatch),
	}
})
  

    
export default connect(mapStateToProps, mapDispatchToProps)(NewsCreator)