import { IFullState, INewsItem, INewsState, TLang } from '../../interfaces'
import './news-details.scss'
import { NavLink, useParams, useNavigate } from 'react-router-dom'
import Preloader from '../../components/Preloaders/Preloader';
import { AnyAction, bindActionCreators } from "redux";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { useEffect, FC, useMemo, useCallback } from "react";
import SpliderCommon from '../../components/Spliders/Common/SpliderCommon';
import { allActions } from "../../redux/actions/all";
import Delete from '../../components/Delete/Delete';
import { navList, resetFetch } from '../../assets/js/consts';
import { modalMessageCreator } from '../../../src/assets/js/processors';
import { IModalFunctions } from '../../../src/components/Modal/ModalNew';
import MessageNew from '../../../src/components/Message/MessageNew';
import svgs from '../../../src/components/additional/svgs';


interface IPropsState {
    lang: TLang
    isAdmin: boolean
    newsState: INewsState
    modal: IModalFunctions | null
}


interface IPropsActions {
    setState: {
        news: typeof allActions.news
    }
}

interface IProps extends IPropsState, IPropsActions {}


const NewsDetails: FC<IProps> = ({lang, setState, newsState, modal, isAdmin }): JSX.Element => {
    const paramNewsId = useParams().newsId || ''
    const navigate = useNavigate()


    useEffect(() => {
		setState.news.loadOneNews(paramNewsId)
        //return () => {setState.news.setLoadOneNews(resetFetch)}
    }, [paramNewsId])




    const onDelete = useCallback((item: INewsItem) => {
        setState.news.deleteNews(item._id)
    }, [newsState.newsList])



    const closeModal = useCallback(async () => {
        if (await modal?.getName() === 'deleteNews') {
            if (newsState.send.status === 'success') {
                navigate(navList.home.to, { replace: true });
                window.location.reload()
            }
            setState.news.setSendNews(resetFetch)
        }
        modal?.closeCurrent()
	}, [newsState.send.status])


    useEffect(() => { 
        if (newsState.send.status === 'success' || newsState.send.status === 'error') {//if admin delete news
            modal?.openModal({
                name: 'deleteNews',
                onClose: closeModal,
                children: <MessageNew {...modalMessageCreator(newsState.send, lang)} buttonClose={{action: closeModal, text: 'Close'}}/>
            })
        }
        if (newsState.loadOne.status === 'error') { //if fail to load news
            modal?.openModal({
                name: 'loadNews',
                onClose: closeModal,
                children: <MessageNew {...modalMessageCreator(newsState.loadOne, lang)} buttonClose={{action: closeModal, text: 'Close'}}/>
            })
            
        }
    }, [newsState.send, newsState.loadOne])


    
    const newsContent = useMemo(() => {
        return (
            <>
                {newsState.loadOne.status === 'success' &&
                    <>
                        <div className="block_text">
                            <h1>{newsState.newsOne.header[lang]}</h1>
                            <span className='news__date'>{String(newsState.newsOne.date.toISOString().slice(0, 10))}</span>
                            {newsState.newsOne.text[lang].split('\n')?.map((text, i) => <p key={i}>{text}</p>)}
                        </div>
                        <div className="news__details">
                            <>
                                <div className="images">
                                    <SpliderCommon 
                                        images={newsState.newsOne.images} 
                                        imagesPerSlide={Math.min(newsState.newsOne.images.files.length, 3)}
                                        modal={modal}/>
                                </div>
                            </>
                        </div>
                    </>}
                {newsState.loadOne.status === 'fetching' && <Preloader />}
                {newsState.loadOne.status === 'error' && <h1>{lang === 'en' ? 'News was not found' : 'Запрашиваемая новость не найдена'}</h1>}
            </>
        )
    }, [lang, newsState.newsOne, newsState.loadOne.status])


    const controls = useMemo(() => {
        return (
            <div className="buttons_control">
                {isAdmin && newsState.newsOne && newsState.loadOne.status === 'success' &&
                    <NavLink className="button_edit" to={`../..${navList.account.admin.news.to}/${newsState.newsOne._id}`}>
                        {svgs().iconEdit}
                    </NavLink>}
                <button className="button_blue button_back" onClick={() => navigate(-1)}>
                    {svgs().iconArrowLeft}
                    {lang === 'en' ? 'Back' : 'Вернуться'}
                </button>
                {isAdmin && newsState.newsOne && newsState.loadOne.status === 'success' && 
                    <Delete<INewsItem> remove={onDelete} idInstance={newsState.newsOne} lang={lang} disabled={newsState.send.status === 'fetching'}/>}
            </div>
        )
    }, [newsState.newsOne, isAdmin, lang, newsState.send.status, newsState.loadOne.status])





    return (
        <div className="page page_news-details">
            <div className="container_page">
                <div className="container">
                    {newsContent}
                    {controls}
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state: IFullState): IPropsState => ({
    lang: state.base.lang,
    isAdmin: state.user.isAdmin,
    newsState: state.news,
    modal: state.base.modal.current
})


const mapDispatchToProps = (dispatch: Dispatch<AnyAction>): IPropsActions => ({
    setState: {
		news: bindActionCreators(allActions.news, dispatch),
	}
})
  

export default connect(mapStateToProps, mapDispatchToProps)(NewsDetails);