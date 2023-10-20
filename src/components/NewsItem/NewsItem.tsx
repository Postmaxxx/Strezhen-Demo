import { INewsItemShort, TLang } from "../../interfaces";
import './news-item.scss'
import { NavLink } from "react-router-dom";
import { useMemo } from "react";
import PicWithPreloader from "../../../src/assets/js/PicWithPreloader";
import svgs from "../additional/svgs";


interface IProps {
    newsPiece: INewsItemShort
    lang: TLang
}




const NewsItem:React.FC<IProps> = ({newsPiece, lang}):JSX.Element => {

   
    return (
        <article className="news-item">
            <div className="img-cont">
                {newsPiece.images.files.length > 0 &&
                    <PicWithPreloader basePath={newsPiece.images.basePath} sizes={newsPiece.images.sizes} image={newsPiece.images.files[0]} alt={newsPiece.header[lang]}/>
                }
            </div>
            <div className="news__content">
                <div className="news__text">
                    <span>{String(newsPiece.date.toISOString().slice(0, 10))}</span>
                    <h3>{newsPiece.header[lang]}</h3>
                    <p>{newsPiece.short[lang]}</p>
                </div>
                <NavLink
                    className="button_blue button_news"
                    to={`news/${newsPiece._id}`}
                    key={newsPiece._id}>
                        {lang === 'en' ? 'Read more...' : 'Подробнее...'}
                        {svgs().iconArrowRight}
                </NavLink>
            </div> 
        </article>
    )
}

export default (NewsItem)  