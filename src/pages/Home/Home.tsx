import { useEffect } from 'react'
import NewsBlock from '../../components/NewsBlock/NewsBlock';
import './home.scss'
import { connect } from "react-redux";
import { IContentState, IFullState, TLang } from "../../interfaces";
import { AnyAction, bindActionCreators } from "redux";
import { Dispatch } from "redux";
import { allActions } from '../../redux/actions/all';
import Preloader from '../../components/Preloaders/Preloader';
import { IModalFunctions } from '../../../src/components/Modal/ModalNew';
import CarouselMaxAdaptive from '../../../src/components/CarouselMax/CarouselMaxAdaptive';


interface IPropsState {
    lang: TLang
    contentState: IContentState
    modal: IModalFunctions | null
}

interface IPropsActions {
    setState: {
        content: typeof allActions.content,
    }
}

interface IProps extends IPropsState, IPropsActions {}

const Home:React.FC<IProps> = ({lang, contentState, setState, modal} : IProps): JSX.Element => {
    
    useEffect(() => {
        if (contentState.load.status !== 'success' && contentState.load.status  !== 'fetching') {
            setState.content.loadCarousel()
        }
	},[])


    return (
        <div className='page page_home'>
            <div className="container_page">
                <div className="container">
                    <section className="intro">
                        <div className="block_text">
                            {lang === 'en' ? 
                                <>
                                    <h1>Unlock Your Imagination</h1>
                                    <p>Welcome to our innovative platform that brings your wildest ideas to life through the power of 3D printing. We're not just a store – we're a gateway to endless possibilities, offering a dual experience of both providing intricate 3D models for your projects and delivering meticulously crafted pre-printed products right to your doorstep.</p>
                                    <h4>Discover the Future of Creation</h4>
                                    <p>Step into a world where imagination knows no bounds. With our 3D printing services, you have the tools to create custom designs that reflect your unique vision. Whether you're an artist, engineer, designer, or hobbyist, our vast library of models and templates ensures you find the perfect foundation for your next masterpiece.</p>
                                    <h4>Your Designs, Your Way</h4>
                                    <p>Are you ready to unleash your creativity? Our user-friendly platform empowers you to upload your designs and customize every aspect to suit your preferences. Tweak dimensions, experiment with materials, and visualize the final product in real-time before it even gets printed. It's your vision, executed exactly as you envision it.</p>
                                    <h4>Not Just a Service – It's an Experience</h4>
                                    <p>But that's not all. We're more than a platform for creators. For those who seek ready-made solutions, our collection of pre-printed products offers a curated selection of expertly crafted items that blend artistry with functionality. From intricately detailed sculptures to functional household items, our store is a treasure trove of one-of-a-kind pieces.</p>
                                    <h4>Seamless Journey from Concept to Reality</h4>
                                    <p>Our seamless ordering process ensures that your journey from concept to reality is smooth and efficient. Once you've perfected your design or chosen your desired pre-printed piece, our team of skilled professionals takes over, ensuring that every print meets our rigorous quality standards.</p>
                                    <h4>Join the 3D Printing Revolution</h4>
                                    <p>Whether you're an aspiring creator or a connoisseur of unique products, our platform invites you to be a part of the 3D printing revolution. Explore, create, and experience innovation like never before. Your ideas are our passion, and together, we'll transform them into tangible wonders.</p>
                                    <h4>Explore our library, unleash your creativity, and let us craft the future – one layer at a time</h4>
                                    <h2>Welcome to Strezhen</h2>
                                </>
                            :
                                <>
                                    <h1>Откройте для себя мир 3D-печати</h1>
                                    <p>Добро пожаловать на наш инновационный портал, который превращает ваши самые смелые идеи в реальность с помощью силы 3D-печати. Мы не просто магазин – мы врата в мир бесконечных возможностей, предлагая двойной опыт предоставления сложных 3D-моделей для ваших проектов и доставки детально изготовленных готовых продуктов прямо к вам на порог.</p>
                                    <h4>Откройте для себя будущее творчества</h4>
                                    <p>Войдите в мир, где воображение не знает границ. С нашими услугами по 3D-печати у вас есть инструменты для создания индивидуальных дизайнов, отражающих вашу уникальную видение. Будь вы художником, инженером, дизайнером или любителем, наша обширная библиотека моделей и шаблонов обеспечивает подходящее основание для вашего следующего шедевра.</p>
                                    <h4>Беспрецедентная точность и качество</h4>
                                    <p>Мы понимаем, что каждая деталь имеет значение. Наша передовая технология 3D-печати превращает цифровые дизайны в осязаемые реалии с непревзойденной точностью. Следите, как ваши творения оживают с поразительной точностью, сложными текстурами и впечатляющими отделками, делая каждое изделие произведением искусства.</p>
                                    <h4>Ваши дизайн, ваше творчество</h4>
                                    <p>Для тех, кто ищет готовые решения, наша коллекция готовых изделий предлагает отобранное собрание искусно изготовленных предметов, сочетающих в себе художественность и функциональность. От сложных скульптур до функциональных предметов быта – наш магазин – это сокровищница уникальных изделий.</p>
                                    <h4>Плавный путь от концепции к реальности</h4>
                                    <p>После того как вы отправили нам свой дизайн или выбрали желаемое готовое изделие, наша команда опытных профессионалов берет на себя ответственность, чтобы каждая печать соответствовала нашим строгим стандартам качества.</p>
                                    <h4>Присоединяйтесь к революции 3D-печати</h4>
                                    <p> Будь вы начинающим творцом или ценителем уникальных продуктов, наша платформа приглашает вас стать частью революции 3D-печати. Исследуйте, создавайте и переживайте инновации, как никогда раньше. Ваши идеи – наша страсть, и вместе мы превратим их в осязаемые чудеса.</p>
                                    <h4>Исследуйте нашу библиотеку, раскройте свою творческую силу и позвольте нам создать будущее – слой за слоем. Добро пожаловать в будущее творчества</h4>
                                    <h2>Добро пожаловать в Стрежень</h2>
                                </>    
                            }
                        </div>
                    </section>
                    <div className="slider__container">
                        {contentState.load.status === 'success' && contentState?.carousel?.images?.files?.length > 0 && <CarouselMaxAdaptive content={contentState.carousel} modal={modal}/>}
                        {contentState.load.status === 'fetching' && <Preloader />}
                    </div>
                    <NewsBlock />
                </div>
            </div>
        </div>
    )
}


const mapStateToProps = (state: IFullState):IPropsState => ({
    lang: state.base.lang,
    contentState: state.content,
    modal: state.base.modal.current
})


const mapDispatchToProps = (dispatch: Dispatch<AnyAction>):IPropsActions => ({
    setState: {
		content: bindActionCreators(allActions.content, dispatch),
	}
})
  
  
export default connect(mapStateToProps, mapDispatchToProps)(Home)