import './fibers.scss'
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { TLang, IFullState, IFibersState } from "../../interfaces";
import { useMemo } from 'react';
import "@splidejs/react-splide/css";    
import Preloader from '../../components/Preloaders/Preloader';
import { NavLink } from 'react-router-dom';
import FiberPreview from '../../components/FiberPreview/FiberPreview';
import { allActions } from "../../redux/actions/all";
import { navList } from '../../../src/assets/js/consts';
import FetchError from '../../components/ErrorFetch/ErrorFetch';


interface IPropsState {
    lang: TLang,
    fibersState: IFibersState
}

interface IPropsActions {
    setState: {
        fibers: typeof allActions.fibers
    }
}

interface IProps extends IPropsState, IPropsActions {}

const Fibers:React.FC<IProps> = ({lang, fibersState}):JSX.Element => { 


    const listOfFibers = useMemo(() => (
        <div className="fibers">
            {fibersState.fibersList.filter(fiber => fiber.active)?.map((fiber, i) => {
                return (
                    <NavLink to={`${navList.fibers.to}/${fiber._id}`} aria-label={lang === 'en' ? '(About fiber)' : ' (О материале)'} key={fiber._id}>
                        <FiberPreview {...{fiber}} lang={lang} key={i}/>  
                    </NavLink>
                )})}
        </div>
    ), [fibersState.fibersList, lang, fibersState.load.status])

    
    return (
        <div className="page page_fibers">
            <div className="container_page">
                <div className="container">
                    <section className="fibers__common-info">
                        {lang === 'en' ? 
                            <div className="block_text">
                                <h1>Materials used in printing</h1>
                                <p>In modern 3D printing, a variety of different materials are used, allowing for products with different properties to be produced for various operating conditions. Both the physical characteristics of the printed model and its cost will differ, which is why it's essential to choose the right printing material.</p>
                                <p>Our company offers you a wide selection of printing materials for a variety of products. Below are the materials we currently offer for producing the desired products. We also invite you to familiarize yourself with the list of terms used in the material descriptions for a more comfortable and comprehensive understanding of their features.</p>
                                <p><b>Stiffness:</b> the degree to which a material resists deformation; important for maintaining shape and stability in various applications.</p>
                                <p><b>Durability:</b> the ability of a material to withstand wear, pressure, or damage over time, ensuring your printed objects last longer.</p>
                                <p><b>Impact Resistance:</b> the capability of a material to absorb and disperse energy upon impact, preserving the integrity of your 3D-printed parts.</p>
                                <p><b>Min Usage Temperature:</b> the lowest temperature at which a material can effectively function, providing insight into its suitability for cold environments.</p>
                                <p><b>Max Usage Temperature:</b> the highest temperature at which a material retains its strength and properties, important for high-temperature applications.</p>
                                <p><b>Thermal Expansion:</b> the degree to which a material changes size in response to temperature fluctuations, influencing dimensional stability during printing.</p>
                                <p><b>Density:</b> the mass of a material per unit volume, a crucial factor for both weight considerations and structural strength in 3D-printed objects.</p>
                                <p><b>Flexibility:</b> the material's ability to bend under stress without breaking; essential for applications requiring movement or impact absorption.</p>
                                <p><b>Elasticity:</b> the capacity of a material to deform under stress and return to its original shape once the stress is removed, vital for spring-like properties.</p>
                                <p><b>Softness:</b> the pliability of a material when pressure is applied, suitable for creating objects with a soft and tactile feel.</p>
                                <p><b>Composite:</b> materials comprised of multiple components, combining distinct properties to achieve a balance of strength, flexibility, and other features.</p>
                                <p><b>UV Resistance:</b> the ability of a material to withstand the effects of ultraviolet radiation, making it suitable for outdoor applications exposed to sunlight.</p>
                                <p><b>Water Resistance:</b> the material's capability to resist the penetration of water, ensuring that your printed objects remain functional even in damp conditions.</p>
                                <p><b>Dissolvability:</b> the property of a material to dissolve in specific solvents, allowing for post-processing or support removal in certain applications.</p>
                                <p><b>Heat Resistance:</b> the material's ability to maintain its integrity and structural properties under high temperatures, essential for applications near heat sources.</p>
                                <p><b>Chemical Resistance:</b> the capacity of a material to resist damage or deterioration when exposed to various chemicals, crucial for specific industrial applications.</p>
                                <p><b>Fatigue Resistance:</b> the material's ability to withstand repeated cyclic loading without failing, making it suitable for objects subjected to constant stress.</p>
                                <p><b>Cutting:</b> the ease with which a material can be cut, important for post-processing, modification, or fine-tuning of your 3D-printed objects.</p>
                                <p><b>Grinding:</b> the material's suitability for grinding or sanding, enabling you to achieve desired shapes, surfaces, or textures after printing.</p>
                                <p><b>Relative Price:</b> the cost of the material compared to other options, an essential factor for budget-conscious projects without compromising quality.</p>
                                <p>At Strezhen, we understand the significance of these properties in the world of 3D printing. Each property plays a crucial role in determining the suitability of a material for specific applications. Explore our range of materials to find the perfect fit for your unique projects.</p>
                            </div>
                        : 
                            <div className="block_text">
                                <h1>Материалы, используемые в печати</h1>
                                <p>В современной 3D печати используется множество различных материалов, позволяющих получить продукт с различными свойствами для разных условий эксплуатации. Отличаться будут как физическте характеристики печатаемого образца, так и его стоимость, вот почему так важно правильно выбрать материал для печати. </p>
                                <p>Наша кампания предлагае Вам широкий выбор материалов для печати для самых различных видов продукции. Ниже представлены материалы, из которых на данный момент мы предлагаем вам изготовить желаемую продукцию. Также мы предлагаем Вам ознакомиться со списком терминов, используемых в описании к материалам, для более комфортного и полного понимания особенностей материалов.</p> 
                                <p><b>Прочность:</b> конкретная нагрузка, которую деталь может выдержать без поломки.</p>
                                <p><b>Жёсткость:</b> степень сопротивления материала деформации; важная для сохранения формы и стабильности в различных приложениях.</p>
                                <p><b>Износостойкость:</b> способность материала противостоять износу, давлению или повреждению с течением времени, обеспечивая долговечность ваших напечатанных объектов.</p>
                                <p><b>Стойкость к ударам:</b> способность материала поглощать и рассеивать энергию при ударе, сохраняя целостность ваших деталей, созданных на 3D-принтере.</p>
                                <p><b>Минимальная рабочая температура:</b> самая низкая температура, при которой материал может эффективно функционировать, предоставляя информацию о его пригодности для холодных сред.</p>
                                <p><b>Максимальная рабочая температура:</b> самая высокая температура, при которой материал сохраняет свою прочность и свойства, важные для высокотемпературных приложений.</p>
                                <p><b>Тепловое расширение:</b> степень изменения размера материала в ответ на колебания температуры, влияющая на размерную стабильность во время печати.</p>
                                <p><b>Плотность:</b> масса материала на единицу объема, ключевой фактор для учета веса и структурной прочности при создании объектов на 3D-принтере.</p>
                                <p><b>Гибкость:</b> способность материала сгибаться под нагрузкой без поломки; необходимая для приложений, требующих движения или поглощения ударов.</p>
                                <p><b>Упругость:</b> способность материала деформироваться под нагрузкой и возвращаться к своей исходной форме после снятия нагрузки, важная для пружинных свойств.</p>
                                <p><b>Мягкость:</b> пластичность материала при давлении, подходящая для создания объектов с мягким и осязаемым ощущением.</p>
                                <p><b>Композит:</b> материалы, состоящие из нескольких компонентов, объединяющие уникальные свойства для достижения баланса прочности, гибкости и других характеристик.</p>
                                <p><b>Стойкость к УФ-излучению:</b> способность материала сопротивляться воздействию ультрафиолетового излучения, делая его подходящим для использования на открытом воздухе под солнечными лучами.</p>
                                <p><b>Стойкость к воде:</b> способность материала противостоять проникновению воды, обеспечивая функциональность ваших напечатанных объектов даже во влажных условиях.</p>
                                <p><b>Растворимость:</b> свойство материала растворяться в определенных растворителях, позволяющее проводить послепечатную обработку или удаление опорных материалов в некоторых приложениях.</p>
                                <p><b>Стойкость к высоким температурам:</b> способность материала сохранять свою структурную целостность при высоких температурах, необходимая для применения рядом с источниками тепла.</p>
                                <p><b>Химическая стойкость:</b> способность материала противостоять повреждениям или разрушению при воздействии различных химических веществ, важная для определенных промышленных приложений.</p>
                                <p><b>Стойкость к усталости и ударам:</b> способность материала выдерживать повторное циклическое нагружение без поломки, подходящая для объектов, подвергаемых постоянным напряжениям.</p>
                                <p><b>Обрезка:</b> легкость обрезки материала, важная для послепечатной обработки, модификации или доведения ваших объектов, созданных на 3D-принтере, до желаемой формы.</p>
                                <p><b>Шлифовка:</b> пригодность материала для шлифовки или обработки шлифовальными инструментами, позволяющая достичь нужной формы, поверхности или текстуры после печати.</p>
                                <p><b>Относительная цена:</b> стоимость материала по сравнению с другими вариантами, существенный фактор для проектов с ограниченным бюджетом, не ущемляя при этом качество.</p>
                                <p>В Стрежень мы понимаем важность этих характеристик в мире 3D-печати. Каждое свойство играет решающую роль при определении пригодности материала для конкретных приложений. Исследуйте наш ассортимент материалов, чтобы найти идеальное решение для ваших уникальных проектов.</p>
                            </div>
                        }
                    </section>
                    <section className="fibers__previews">
                        {fibersState.load.status === 'fetching' && <Preloader />}
                        {fibersState.load.status === 'success' && listOfFibers}
                        {fibersState.load.status === 'error' && <FetchError fetchData={fibersState.load} lang={lang} />}
                    </section>
                </div>
            </div>
        </div>
    )
}


const mapStateToProps = (state: IFullState): IPropsState  => ({
    lang: state.base.lang,
    fibersState: state.fibers,
})

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>): IPropsActions => ({
    setState: {
		fibers: bindActionCreators(allActions.fibers, dispatch),
	}
})

  
    
export default connect(mapStateToProps, mapDispatchToProps)(Fibers)
