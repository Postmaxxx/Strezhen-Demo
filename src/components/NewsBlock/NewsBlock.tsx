import './news_block.scss'
import { Fragment, useMemo,useEffect } from 'react'
import { connect } from "react-redux";
import NewsItem from '../NewsItem/NewsItem'
import { IFullState, INewsState, TLang } from '../../interfaces'
import { AnyAction, Dispatch, bindActionCreators } from 'redux';
import { allActions } from "../../redux/actions/all";
import Preloader from '../Preloaders/Preloader';
import { loadNewsPerRequest } from '../../../src/assets/js/consts';


interface IPropsState {
    lang: TLang,
    news: INewsState
}

interface IPropsActions {
    setState: {
        news: typeof allActions.news
    }
}

interface IProps extends IPropsState, IPropsActions {}

const NewsBlock:React.FC<IProps>  = ({lang, news, setState}): JSX.Element => {
    
    const showMoreNews = () => {   
		setState.news.loadSomeNews({from: news.newsList.length, amount: loadNewsPerRequest})
    }

    useEffect(() => {
        if (news.load.status == 'idle') {
            showMoreNews()
        }
    }, [])



    const previewsNews = useMemo(() => news.newsList.map((newsPiece) => (
        <Fragment key={newsPiece._id}>
            <NewsItem newsPiece={newsPiece} lang={lang}/>
        </Fragment>
    )), [lang, news])

    return (
        <section className="news">
            <h2>{lang === 'en' ? 'Recent news' : 'Последние новости'}</h2>
            {previewsNews}
            {news.newsList.length === 0 && news.load.status === 'success' && <span className='no-news'>{lang === 'en' ? 'No news' : 'Новостей нет'}</span>}
            <div className="break-new-line"></div>
            {news.newsList.length < news.total && (
                <button className='button_blue show-more-news' onClick={showMoreNews}>
                    {lang === 'en' ? 'Show more news' : 'Показать еще новости'}
                </button>
            )}
            {news.newsList.length === 0 && news.load.status !== 'success' && <Preloader />}
        </section>
    )
}




const mapStateToProps = (state: IFullState): IPropsState => ({
    lang: state.base.lang,
    news: state.news,
})



const mapDispatchToProps = (dispatch: Dispatch<AnyAction>):IPropsActions => ({
    setState: {
		news: bindActionCreators(allActions.news, dispatch),
	}
})
  
export default connect(mapStateToProps, mapDispatchToProps)(NewsBlock)
