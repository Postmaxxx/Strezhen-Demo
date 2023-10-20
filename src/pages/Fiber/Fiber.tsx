import './fiber.scss'
import { NavLink, useNavigate, useParams  } from 'react-router-dom';
import { useEffect, useMemo,useCallback } from 'react';
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import Preloader from '../../components/Preloaders/Preloader';
import { TLang, IFullState, IFiber, IFibersState, IColorsState, IColor } from "../../interfaces";
import { allActions } from "../../redux/actions/all";
import { navList, resetFetch } from '../../assets/js/consts';
import SpliderCommon from '../../components/Spliders/Common/SpliderCommon';
import FiberParams from '../../components/FiberParams/FiberParams';
import Proscons from '../../components/Proscons/Proscons';
import ImgWithPreloader from '../../assets/js/ImgWithPreloader';
import { deepCopy, modalMessageCreator } from '../../assets/js/processors';
import ErrorFetch from '../../components/ErrorFetch/ErrorFetch';
import { IModalFunctions } from '../../../src/components/Modal/ModalNew';
import MessageNew from '../../../src/components/Message/MessageNew';
import ImageModalNew from '../../../src/components/ImageModal/ImageModalNew';

interface IPropsState {
    lang: TLang,
    fibersState: IFibersState
    colorsState: IColorsState
    isAdmin: boolean
    modal: IModalFunctions | null
}

interface IPropsActions {
    setState: {
        fibers: typeof allActions.fibers
        colors: typeof allActions.colors
    }
}

interface IProps extends IPropsState, IPropsActions {}


const Fiber: React.FC<IProps> = ({lang, fibersState, colorsState, setState, modal, isAdmin}):JSX.Element => {
    const paramFiberId = useParams().fiberId || ''
    const navigate = useNavigate()
    

    useEffect(() => {
        if (fibersState.send.status === 'success' || fibersState.send.status === 'error') {
            modal?.openModal({ //if error/success - show modal about send order
                name: 'fiberSend',
                onClose: closeModal,
                children: <MessageNew {...modalMessageCreator(fibersState.send, lang)} buttonClose={{action: closeModal, text: 'Close'}}/>
            })
        }
    }, [fibersState.send.status])


    const closeModal = useCallback(async () => {
        if (await modal?.getName() === 'fiberSend') {
            if (fibersState.send.status === 'success') {
                navigate(navList.fibers.to, { replace: true });
                window.location.reload()
            }
            setState.fibers.setSendFibers(deepCopy(resetFetch))
        }
        modal?.closeCurrent()
	}, [fibersState.send.status])


    
    const onImageClick = (e: React.MouseEvent , color: IColor) => {
        e.stopPropagation()
        modal?.openModal({
            name: 'onFiberImageClick',
            children: <ImageModalNew url={color.urls.full} text={color.name[lang]}/>
        })
    }


    useEffect(() => {
        if (colorsState.load.status !== 'success' && colorsState.load.status  !== 'fetching') {
			setState.colors.loadColors()
		}
    }, [])
    

    useEffect(() => {
        if (fibersState.load.status === 'success') {
            setState.fibers.setSelectedFiber(paramFiberId)
        }
    }, [paramFiberId, fibersState.load.status]) 


    const firberColors = useCallback((fiber: IFiber) => {
        return fiber.colors.map((color, i) => {
            const colorData: IColor | undefined = colorsState.colors.find(colorItem => colorItem._id === color)
            if (colorData && colorData.active) {
                return (
                    <div key={i} className='color' onClick={(e) => onImageClick(e, colorData)}>
                        <div className="color__img-cont">
                            <ImgWithPreloader src={colorData.urls.thumb} alt={colorData.name[lang]}/>
                        </div>
                        <span className='color__descr'>{colorData.name[lang]}</span>
                    </div>
                )
            }
        })
    }, [colorsState.colors])


    const renderFiberItem = useMemo(() => {
        const fiber = fibersState.fibersList.find(item => item._id === fibersState.selected)         
        return fiber ? (
            <article className="fiber">
                <h1>{fiber.short.name[lang]} ({fiber.name[lang]})</h1>
                <section className='fiber__images-text'>
                    <SpliderCommon images={fiber.images} imagesPerSlide={fiber.images.files?.length > 3 ? 3 : fiber.images.files?.length} modal={modal}/>
                    <div className="block_text">
                        {fiber.text[lang].split('\n').map((textItem, i) => <p key={textItem}>{textItem}</p>)}
                    </div>
                </section>
                <div className="block_text">
                    <section className="features">
                        <h3>{lang === 'en' ? 'Features' : 'Характеристики'}</h3>
                        <FiberParams params={fiber.params} fiber={fiber} lang={lang}/>
                    </section>
                    <section className="colors">
                        <h3>{lang === 'en' ? 'Available colors' : 'Доступные цвета'}</h3>
                        <div className="colors__items">
                            {firberColors(fiber)}
                        </div>
                    </section>
                    <section className="proscons-wrapper">
                        <h3>{lang === 'en' ? 'Pros and сons' : 'Плюсы и минусы'}</h3>
                        <Proscons {...fiber.proscons} lang={lang}/>
                    </section>
                </div>
                <NavLink
                    className="button_blue link_compare"
                    to={navList.fibers.compare.to}>
                        {lang === 'en' ? 'Watch in comparasing' : 'Посмотреть в сравнении'}
                </NavLink>
            </article>)
        :
            <ErrorFetch lang={lang} fetchData={{status: 'error', message: {en: 'Fiber has not been found', ru: 'Данный материал не найден'}}} />
    }, [paramFiberId, lang, fibersState.load.status, colorsState.load.status, fibersState.selected, isAdmin, fibersState.fibersList])




    return (
        <div className="page page_fiber">
            <div className="container_page">
                <div className="container">
                    {fibersState.load.status === 'success' && renderFiberItem}
                    {fibersState.load.status === 'fetching' && <Preloader />}
                    {fibersState.load.status === 'error' && <ErrorFetch fetchData={fibersState.load} lang={lang} />}
                </div>
            </div>           
        </div>
    )
}


const mapStateToProps = (state: IFullState): IPropsState  => ({
    lang: state.base.lang,
    fibersState: state.fibers,
    colorsState: state.colors,
    isAdmin: state.user.isAdmin,
    modal: state.base.modal.current
})


const mapDispatchToProps = (dispatch: Dispatch<AnyAction>):IPropsActions => ({
    setState: {
		fibers: bindActionCreators(allActions.fibers, dispatch),
		colors: bindActionCreators(allActions.colors, dispatch),
	}
})
  
export default connect(mapStateToProps, mapDispatchToProps)(Fiber)