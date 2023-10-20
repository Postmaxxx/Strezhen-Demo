import './carouselmax.scss'
import { useEffect,useRef, useState,useCallback } from 'react';
import ImgWithPreloader from '../../assets/js/ImgWithPreloader'
import { ICarouselMax, IContentState, IImages } from '../../interfaces';
import { IModalFunctions } from '../Modal/ModalNew';
import ImageModalNew from '../ImageModal/ImageModalNew';
import PicWithPreloader from '../../../src/assets/js/PicWithPreloader';
import svgs from '../additional/svgs';


interface IOptions {
    imageContainerWidth: number
    innerContainerWidth :number
    carouselCenterDx: number
    paddings: number
    initialRibbonPos: number
    deltaSize: number
    carouselWidth: number
    imageRatio: number
    parallaxRatio: number
    imageWidth: number
    gap: number
    initialSpeed: number
    mouseSensivity: number
    carouselMaxSpeed: number
    carousecInertia: number
}


const options: IOptions = {
    imageContainerWidth: 600,
    imageWidth: 0,
    imageRatio: 1.2,
    parallaxRatio: 0,
    innerContainerWidth: 0,
    carouselCenterDx: 0,
    paddings: 0,
    initialRibbonPos: 0,
    deltaSize: 0,
    carouselWidth: 0,
    gap: 80,
    initialSpeed: 0.001, //speed by default, min speed (>0), speed carousel tends to
    mouseSensivity: 0.005, //more carousel sensevity for mouse movings
    carouselMaxSpeed: 0.03, //carousel max speed
    carousecInertia: 0.997, //multiplier for carousel speed in time until carousel speed reachs initialSpeed
}

interface ISliderMax {
    content: ICarouselMax
    modal: IModalFunctions | null
}


const CarouselMaxAdaptive = ({content, modal}: ISliderMax) => {
    const _carouselRef = useRef<HTMLDivElement>(null)
    const [ribbonPos, setRibbonPos] = useState<number>(0) //initial ribbon position
    const [state, setState] = useState<IOptions>({...options})
    const [ribbonDx, setRibbonDx] = useState<number>(0) //delta for ribbon position
    const [images, setImages] = useState<IImages>(content.images)
    const prevPos = useRef<number>(0) //prev mouse position for every measuring
    const step = useRef<number>(0) //step for carousel delta for every calling (changeRibbonDx) for background moving
    const isMoving = useRef<number>(1)//is carousel moves on background
    const delta = useRef<number>(0) //delta for carousel for moving by mouse
    const newDx = useRef<number>(0) //new ribbon position, for calculating ribbonDx
    const mouseSpeed = useRef<number>(0) //mouseSpeed, pixels between measurements
    const [firstRender, setFirstRender] = useState<boolean>(true)



    useEffect (() => {//initial settings, set all parameters for carousel like container width, total amount of images, ...
        if (!_carouselRef.current) return;
        
        if (firstRender) {
            const carouselContainerWidth = _carouselRef.current.clientWidth //initial settings, get container carousel width
            setState(prev => ({...prev, imageContainerWidth: carouselContainerWidth/2, gap: carouselContainerWidth / 15}))
            setFirstRender(false)
            return
        }
        const innerContainerWidth = state.imageContainerWidth

        const imagesPerContainer = Math.ceil(_carouselRef.current.offsetWidth / state.imageContainerWidth);
        setImages(prev => ({
            ...prev,
            files: [...prev.files.slice(-imagesPerContainer).reverse(), ...prev.files, ...prev.files.slice(0,imagesPerContainer)]
        }));
        
        const initialRibbonPos = -state.imageContainerWidth * imagesPerContainer
        
        const carouselCenterDx = imagesPerContainer * state.imageContainerWidth
        const deltaSize = (state.imageContainerWidth * state.imageRatio)*0.5
        const parallaxRatio = state.imageContainerWidth*(state.imageRatio - 1)/(_carouselRef.current.offsetWidth - state.imageContainerWidth) 
        const imageWidth = state.imageContainerWidth * state.imageRatio
        setState((prev) => ({...prev, innerContainerWidth, initialRibbonPos, carouselCenterDx, deltaSize, carouselWidth: (_carouselRef.current as HTMLDivElement).offsetWidth, parallaxRatio, imageWidth}))
        setRibbonPos(initialRibbonPos)
    },[firstRender])




    const changeRibbonDx = () => {
        newDx.current += (step.current * isMoving.current) + delta.current //move ribbon to delta = (sum all mouse dx between calling (changeRibbonDx))
        if (newDx.current < -images.files.length * state.imageContainerWidth) { //if too left/right -> reset delta
            newDx.current += images.files.length * state.imageContainerWidth 
        }
        if (newDx.current > 0) {
            newDx.current -= images.files.length * state.imageContainerWidth 
        }
        setRibbonDx(newDx.current) 

        delta.current = 0 
        if (Math.abs(mouseSpeed.current) > Math.abs(options.initialSpeed)) { //reduce carousel speed in time, simulate mouse speed is reducing
            mouseSpeed.current *= options.carousecInertia
            step.current = mouseSpeed.current * state.imageContainerWidth
        }
        //let dx = state.parallaxRatio*(state.carouselCenterDx - state.imageContainerWidth*(2) - ribbonDx);
        //_carouselRef.current?.style.setProperty('--dx', `${newDx.current + ribbonPos}px`);
        //console.log(getComputedStyle(_carouselRef.current as Element).getPropertyValue('--dx'));
        //console.log(newDx.current + ribbonPos);
        
    }


    const mouseDown =(e: MouseEvent) => {
        prevPos.current = e.clientX
        isMoving.current = 0//prohibit automoving
        mouseSpeed.current = 0 //stop background moving
    }

    
    const mouseUp =(e: MouseEvent) => {
        step.current = mouseSpeed.current * state.imageContainerWidth * options.mouseSensivity //calculate step for carousel when mouse button released or leave and * carousel width
        isMoving.current = 1 //let automoving
    }


    const mouseMove = (e: MouseEvent) => {
        if (e.buttons === 1) {
            delta.current += e.clientX - prevPos.current; //saves all amount of mouse deltaX between calling (changeRibbonDx)
            mouseSpeed.current = delta.current * options.mouseSensivity //get mousespeed - how much mouse moves between measurements
            mouseSpeed.current = mouseSpeed.current > 0 ? Math.min(mouseSpeed.current, options.carouselMaxSpeed) : Math.max(mouseSpeed.current, -options.carouselMaxSpeed) //for reverse and forward moving + limits mouseSpeed
            prevPos.current = e.clientX //saves last measured mouse position
        }
    }

    const mouseEnter = (e: MouseEvent) => {
        prevPos.current = e.clientX //avoid abrupt jump if mose enter with pressed button
    }

    const mouseLeave = (e: MouseEvent) => {
        if (e.buttons !== 1) return 
        mouseUp(e)
    }


    const onImageExpand = (url: string) => {
        modal?.openModal({
            name: 'carouselMax',
            onClose: closeModalImage,
            children: <ImageModalNew url={url}/>
        })
        isMoving.current = 0 //deny background moving after open modal
    }


    const closeModalImage = useCallback(() => {
        isMoving.current = 1 //allow moving after close modal
        modal?.closeCurrent()
	}, [])

    const onResize = () => {
        setFirstRender(true)
    }
    
    useEffect(() => {
        if (firstRender) return
        step.current = -options.initialSpeed * state.imageContainerWidth
        const ribbonMoveInterval = setInterval(changeRibbonDx, 5)
        _carouselRef.current?.addEventListener('mousedown', mouseDown)
        _carouselRef.current?.addEventListener('mouseup', mouseUp)
        _carouselRef.current?.addEventListener('mousemove', mouseMove)
        _carouselRef.current?.addEventListener('mouseenter', mouseEnter)
        _carouselRef.current?.addEventListener('mouseleave', mouseLeave)
        window.addEventListener("resize", onResize)

        return (()=> {
            clearInterval(ribbonMoveInterval)
            window.removeEventListener("resize", onResize)
            _carouselRef.current?.removeEventListener('mousedown', mouseDown)
            _carouselRef.current?.removeEventListener('mouseup', mouseUp)
            _carouselRef.current?.removeEventListener('mousemove', mouseMove)
            _carouselRef.current?.removeEventListener('mouseenter', mouseEnter)
            _carouselRef.current?.removeEventListener('mouseleave', mouseLeave)
        })
    }, [firstRender])





    return (
        <div className="carouselmax" ref={_carouselRef}>
            <div className="ribbon" style={{transform: `translate(${ribbonDx + ribbonPos}px)`}}>
                {images.files.map((image, index) => {
                    let dx = state.parallaxRatio*(state.carouselCenterDx - state.imageContainerWidth*(index) - ribbonDx);
                    return(
                        <div className="img-wrapper" key={index} style={{width: `${state.imageContainerWidth}px`, paddingLeft: state.paddings, paddingRight: state.paddings}}>
                            <div className="img__outer-container" style={{width: `${state.imageContainerWidth - state.gap}px`}}>
                                <div className="img__inner-container" style={{width: `${state.imageWidth}px`, transform: `translate(${dx}px)`}}>
                                    {state.imageWidth && <PicWithPreloader basePath={content.images.basePath} sizes={content.images.sizes} image={image} alt={image}/>}
                                </div>
                            </div>
                            <div className="image-extender" onClick={() => onImageExpand(`${images.basePath}/${images.sizes[images.sizes.length - 1].subFolder}/${image}`)}>
                                {svgs().iconExpandCarousel}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}


export default CarouselMaxAdaptive;