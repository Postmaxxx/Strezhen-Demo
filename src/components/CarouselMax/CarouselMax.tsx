/*import './carouselmax.scss'
import { useEffect,useRef, useState,useCallback } from 'react';
import ImgWithPreloader from '../../assets/js/ImgWithPreloader'
import { ICarouselMax } from '../../interfaces';
import { IModalFunctions } from '../Modal/ModalNew';
import ImageModalNew from '../ImageModal/ImageModalNew';


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
    initialSpeed: 0.0006, //speed by default, min speed (>0), speed carousel tends to
    mouseSensivity: 0.005, //more carousel sensevity for mouse movings
    carouselMaxSpeed: 0.03, //carousel max speed
    carousecInertia: 0.997, //multiplier for carousel speed in time until carousel speed reachs initialSpeed
}

interface ISliderMax {
    content: ICarouselMax
    modal: IModalFunctions | null
}


const SliderMax = ({content, modal}: ISliderMax) => {
    const _carouselRef = useRef<HTMLDivElement>(null)
    const [ribbonPos, setRibbonPos] = useState<number>(0) //initial ribbon position
    const [state, setState] = useState<IOptions>({...options})
    const [ribbonDx, setRibbonDx] = useState<number>(0) //delta for ribbon position
    const [images, setImages] = useState<{urlSplider: string, urlFull: string, filename: string}[]>(content.files.map(filename => ({
        urlSplider: `${content.paths.spliderMain}/${filename}`, 
        urlFull: `${content.paths.full}/${filename}`, 
        filename})))
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
        if (_carouselRef.current.clientWidth < 200) {
            setImages(content.files.map(filename => ({urlSplider: `${content.paths.spliderMain}/${filename}`, urlFull: `${content.paths.full}/${filename}`, filename})))
        }

        const imagesPerContainer = Math.ceil(_carouselRef.current.offsetWidth / state.imageContainerWidth);
        setImages(prev => [...prev.slice(-imagesPerContainer).reverse(),...prev, ...prev.slice(0,imagesPerContainer)]);
        
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
        if (newDx.current < -images.length * state.imageContainerWidth) { //if too left/right -> reset delta
            newDx.current += images.length * state.imageContainerWidth 
        }
        if (newDx.current > 0) {
            newDx.current -= images.length * state.imageContainerWidth 
        }
        setRibbonDx(newDx.current) 

        delta.current = 0 
        if (Math.abs(mouseSpeed.current) > Math.abs(options.initialSpeed)) { //reduce carousel speed in time, simulate mouse speed is reducing
            mouseSpeed.current *= options.carousecInertia
            step.current = mouseSpeed.current * state.imageContainerWidth
        }
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


    const onImageExpand = (urlFull: string) => {
        modal?.openModal({
            name: 'carouselMax',
            onClose: closeModalImage,
            children: <ImageModalNew url={urlFull}/>
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
            <div className="ribbon" style={{left: `${ribbonPos + ribbonDx}px`}}>
                {images.map((image, index) => {
                    let dx = state.parallaxRatio*(state.carouselCenterDx - state.imageContainerWidth*(index) - ribbonDx);
                    return(
                        <div className="img-wrapper" key={index} style={{width: `${state.imageContainerWidth}px`, paddingLeft: state.paddings, paddingRight: state.paddings}}>
                            <div className="img__outer-container" style={{width: `${state.imageContainerWidth - state.gap}px`}}>
                                <div className="img__inner-container" style={{width: `${state.imageWidth}px`, left: `${dx}px`}}>
                                    <ImgWithPreloader src={image.urlSplider} alt={image.filename} />
                                </div>
                            </div>
                            <div className="image-extender" onClick={() => onImageExpand(image.urlFull)}>
                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xmlSpace="preserve">
                                    <path d="M512,23.27v116.36c0,12.8-10.47,23.27-23.27,23.27c-12.8,0-23.27-10.47-23.27-23.27V79.71L330.47,214.69
                                        c-4.65,4.65-10.47,6.98-16.29,6.98s-11.64-2.32-16.29-6.98c-9.31-9.31-9.31-23.86,0-33.16l134.4-134.98h-59.93
                                        c-12.8,0-23.27-10.47-23.27-23.27c0-12.8,10.47-23.27,23.27-23.27h116.36c6.4,0,12.22,2.33,16.29,6.98
                                        C509.67,11.05,512,16.87,512,23.27z M488.73,349.09c-12.8,0-23.27,10.47-23.27,23.27v59.93L332.8,300.8
                                        c-9.31-9.31-24.44-9.31-33.75,0c-9.31,9.31-9.31,23.85-0.58,33.16l131.49,131.49h-59.93c-12.8,0-23.27,10.47-23.27,23.27
                                        c0,12.8,10.47,23.27,23.27,23.27H486.4c6.4,0,13.38-2.33,17.45-6.98c4.65-4.65,8.15-10.47,8.15-16.29V372.36
                                        C512,359.56,501.53,349.09,488.73,349.09z M179.2,299.64L46.55,432.29v-59.93c0-12.8-10.47-23.27-23.27-23.27S0,359.56,0,372.36
                                        v116.36c0,6.4,2.32,12.22,6.98,16.29c4.65,4.65,10.47,6.98,16.87,6.98h116.36c12.8,0,23.27-10.47,23.27-23.27
                                        c0-12.8-10.47-23.27-23.27-23.27H79.71L212.36,332.8c9.31-9.31,8.73-23.86,0-33.16C203.64,290.33,188.51,290.33,179.2,299.64z
                                        M79.71,48.87h59.93c12.8,0,23.27-10.47,23.27-23.27S152.44,2.33,139.64,2.33H23.27c-6.4,0-12.22,2.33-16.29,6.98
                                        C2.32,13.38,0,19.2,0,25.6v116.36c0,12.8,10.47,23.27,23.27,23.27s23.27-10.47,23.27-23.27V81.45l134.4,134.4
                                        c4.65,4.66,10.47,6.98,16.29,6.98s11.64-2.32,16.3-6.98c9.31-9.31,9.31-23.85,0-33.16L79.71,48.87z"/>
                                </svg>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}


export default SliderMax;*/