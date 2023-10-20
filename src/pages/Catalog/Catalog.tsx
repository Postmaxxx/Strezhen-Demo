import './catalog.scss'
import SpliderSingle from '../../components/Spliders/Single/SpliderSingle';
import "@splidejs/react-splide/css"; 
import CategoriesList from '../../components/CatalogList/CatalogList';
import CatalogIntro from '../../components/CatalogIntro/CatalogIntro';
import { memo } from 'react';
import { connect } from "react-redux";
import { IFullState, TLang } from 'src/interfaces';


const CatalogIntroMemo = memo(CatalogIntro)
const CategoriesListMemo = memo(CategoriesList)
const SpliderSingleMemo = memo(SpliderSingle)

interface IPropsState {
    lang: TLang
}

const Catalog: React.FC<IPropsState> = ({lang}): JSX.Element => {
    return (
        <div className="page page_catalog">
            <div className="container_page">
                <div className="container">
                    <div className="block_text">
                        <h1>{lang === 'en' ? 'Catalog' : 'Каталог'}</h1>
                    </div>
                    <CatalogIntroMemo />
                    <section className="catalog">
                        <div className="block_text">
                            <h2>{lang === 'en' ? 'Our catalog' : 'Наш каталог'}</h2>
                        </div>
                        <div className="catalog__content">
                            <CategoriesListMemo />
                            <SpliderSingleMemo />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state: IFullState):IPropsState => ({
    lang: state.base.lang,
})

export default connect(mapStateToProps)(Catalog)

