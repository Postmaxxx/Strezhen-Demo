import { connect } from "react-redux";
import React from "react";
import { IFullState, TLang } from "../../interfaces";
import './catalog-intro.scss'
import catalogPhoto1 from '../../assets/img/catalog/catalog_hero.webp'
import ImgWithPreloader from "../../assets/js/ImgWithPreloader";


interface IPropsState {
    lang: TLang
}


const CatalogIntro:React.FC<IPropsState> = ({lang}): JSX.Element => {
    return (
        <section className="catalog-intro">
            <div className="catalog-intro__image">
                <ImgWithPreloader src={catalogPhoto1} alt={lang === 'en' ? 'Catalog image' : 'Фото каталога'}/>
            </div>
            <div className="catalog-intro__text">
                <h2>{lang === 'en' ? 'Explore our 3D printing catalog' : 'Предлагаем Вам каталог готовых изделий'}</h2>
                {lang === 'en' ? 
                    <>
                        <p>Dive into a realm of limitless possibilities as you browse through our meticulously curated collection. From intricately detailed art pieces to precision-engineered prototypes, our catalog showcases the convergence of creativity and technology.</p>
                        <p>Explore the tangible results of innovation and craftsmanship, all crafted using advanced 3D printing techniques. Discover the perfect embodiment of your ideas among a diverse array of products, ready to bring your imagination to life.</p>
                    </>
                    :
                    <>
<p>Окунитесь в мир безграничных возможностей, просматривая наш тщательно подобранный ассортимент. От искусно детализированных художественных произведений до точно спроектированных прототипов, наш каталог демонстрирует сплав творчества и технологии.</p>
<p>Исследуйте осязаемые результаты инноваций и мастерства, созданные с использованием передовых техник 3D-печати. Откройте для себя идеальное воплощение ваших идей среди разнообразных продуктов, готовых привести ваше воображение к жизни.</p>
                    </> }
            </div>
        </section>
    )
}

const mapStateToProps = (state: IFullState): IPropsState => ({
    lang: state.base.lang,
})




export default connect(mapStateToProps)(CatalogIntro);