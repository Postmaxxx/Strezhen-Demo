import './splider-common.scss'
import Splide from "@splidejs/splide";
import { IImages, ISpliderOptions } from '../../../interfaces';
import "@splidejs/react-splide/css";
import { useRef, useEffect, MouseEvent, useMemo, useState } from 'react'
import { IModalFunctions } from '../../../../src/components/Modal/ModalNew';
import ImageModalNew from '../../../../src/components/ImageModal/ImageModalNew';
import PicWithPreloader from '../../../../src/assets/js/PicWithPreloader';



interface IProps {
	images: IImages
    imagesPerSlide?: number
    modal: IModalFunctions | null
}

interface IContainerSize {
	width: number
	height: number
}



const SpliderCommon: React.FC<IProps> = ({images, imagesPerSlide=1, modal}): JSX.Element => {
	
	const splideCommon = useRef<Splide>();
	const containerSize = useRef<IContainerSize>();
	const _splideFabric = useRef<any>();
	const [spliderCreated, setSpliderCreated] = useState<boolean>(false);

    const options: Partial<ISpliderOptions> = {
        perPage: imagesPerSlide,
        gap: '5%',
		rewind: true,
		lazyLoad: true,
		updateOnMove: true,
		perMove: 1,
		pagination: true,
		arrows: true,
		drag: true,
		speed: 500,
		autoplay: true,
		interval: 5000,
		pauseOnHover: true,
		breakpoints: {
			768: {
				wheel: false,
				perPage: 2,
                pagination: false,
			}, 
			480: {
				perPage: 1,
			}, 
		},
	};
 
	const handleImgClick = (e: MouseEvent<HTMLDivElement>) => {
		if ((e.target as HTMLImageElement).tagName === 'IMG') {
			const id = Number(((e.target as HTMLImageElement).id));
			modal?.openModal({
				name: 'spliderCommonModal',
				children: <ImageModalNew url={`${images.basePath}/${images.sizes[images.sizes.length - 1].subFolder}/${images.files[id]}`}/>
			})
		}
	}



	useEffect(() => {
		containerSize.current = {
			width:  _splideFabric.current.offsetWidth,
			height:  _splideFabric.current.offsetHeight,
		};
		splideCommon.current = new Splide(_splideFabric.current, options);
		splideCommon.current.mount();
		setSpliderCreated(true)
		return () => {
    		splideCommon.current?.destroy();		
		};
	}, []);

	
	const imagesCommon = useMemo(() => {
		return images.files?.map((file, i) => {
			return (
				<li className="splide__slide" key={i}>
					<div className="splide__slide-content">
						{spliderCreated && <PicWithPreloader basePath={images.basePath} sizes={images.sizes} image={file} alt={file} id={`${i}`}/>}
					</div>
				</li>
			);
		})
	}, [images.files, spliderCreated])


	return (
        <div className='splider_common__wrapper' onClick={(e) => handleImgClick(e)}>
            <div className="splide" ref={_splideFabric} aria-label="The slider of images">
                <div className="splide__track">
                    <ul className="splide__list">
                        {imagesCommon}
                    </ul>
                </div>
            </div>
        </div>
	)
};




export default SpliderCommon;
