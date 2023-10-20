import { AnyAction, Dispatch, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { useEffect, useRef, useMemo, useState} from "react";
import "@splidejs/react-splide/css";
import "./splider-preview.scss";
import { IFullState, IImages, ISpliderOptions, TLang } from "../../../interfaces";
import Splide from "@splidejs/splide";
import { allActions } from "../../../redux/actions/all";
import { IModalFunctions } from "../../../../src/components/Modal/ModalNew";
import ImageModalNew from "../../../../src/components/ImageModal/ImageModalNew";
import PicWithPreloader from "../../../../src/assets/js/PicWithPreloader";




interface IPropsState {
	lang: TLang,
    modal: IModalFunctions | null
}


interface IPropsActions {
    setState: {
        catalog: typeof allActions.catalog
    }
}


interface IProps extends IPropsState, IPropsActions {
	images: IImages
}


const SpliderPreview: React.FC<IProps> = ({ modal, images}): JSX.Element => {
	const _splideMain = useRef<HTMLDivElement>(null);
	const _splideThumbs = useRef<HTMLDivElement>(null);
	const splideMain = useRef<Splide>();
	const splideThumb = useRef<Splide>();
	const [spliderMainCreated, setSpliderMainCreated] = useState<boolean>(false);
	const [spliderThumbCreated, setSpliderThumbCreated] = useState<boolean>(false);


	
	const optionsThumbs: Partial<ISpliderOptions> = {
		lazyLoad	: false,
		perPage		: 5,
		gap        	: '5%',
		rewind     	: false,
		pagination 	: false,
		isNavigation: true,
		focus		: "center",
		direction   : 'ltr',
		wheel       : true,
		releaseWheel: true,
		height: '100%',
		breakpoints	: {
			1600: {
				perPage: 5
			}, 
			1241: {
				perPage: 5
			}, 
			992: {
				perPage: 4
			}, 
			768: {
				perPage: 3	,
				direction   : 'ltr',
				height: 'auto',
				gap: '5%'
			}, 
			480: {
				perPage: 3
			}, 
		},
	};


	const optionsMain: Partial<ISpliderOptions> = {
		lazyLoad: true,
		type      : "fade",
		rewind    : false,
		pagination: false,
		speed: 500,
		wheel: false,
		wheelSleep: 300,
		breakpoints	: {
			768: {
				wheel: false
			}, 
		}
	};




	const onImageClick = (e: React.MouseEvent , filename: string) => {
        if (!filename) return
        e.stopPropagation()
		modal?.openModal({
			name: 'spliderPreview',
			children: <ImageModalNew url={`${images.basePath}/${images.sizes[images.sizes.length - 1].subFolder}/${filename}`}/>
		})
    }


	useEffect(() => {
        if (!_splideThumbs.current || !_splideMain.current) return
		splideThumb.current = new Splide(_splideThumbs.current, optionsThumbs)
		splideMain.current = new Splide(_splideMain.current, optionsMain)
		splideMain.current.sync(splideThumb.current)
		splideMain.current.mount()
		splideThumb.current.mount()
        setSpliderMainCreated(true)
		setSpliderThumbCreated(true)
		return () => {
			splideThumb.current?.destroy();
			splideMain.current?.destroy();
		};
	}, []);


	const imagesMain = useMemo(() => {
		return images.files.map((filename) => {
			return (
				<li className="splide__slide" key={filename} onClick={(e) => onImageClick(e, filename)}>
					{spliderThumbCreated && <PicWithPreloader basePath={images.basePath} sizes={images.sizes} image={filename} alt={filename}/>}
				</li>
			);
		})
	}, [images.files, spliderThumbCreated])


	const imagesThumb = useMemo(() => {
		return images.files.map((filename) => {
			return (
				<li className="splide__slide" key={filename}>
					{spliderMainCreated && <PicWithPreloader basePath={images.basePath} sizes={images.sizes} image={filename} alt={filename}/>}
				</li>
			);

		})
	}, [images.files, spliderMainCreated])

	
	return (
        <div className="splider_preview">
			<div id="spliderMain" className="splide" ref={_splideMain}>
				<div className="splide__track">
					<ul className="splide__list">
						{imagesMain}
					</ul>
				</div>
			</div>
			<div id="spliderThumbs" className="splide" ref={_splideThumbs}>
				<div className="splide__track">
					<ul className="splide__list">
						{imagesThumb}
					</ul>
				</div>
			</div>
        </div>
	);
};



const mapStateToProps = (state: IFullState): IPropsState  => {
	return {
		lang: state.base.lang,
		modal: state.base.modal.current
	};
};




const mapDispatchToProps = (dispatch: Dispatch<AnyAction>):IPropsActions => ({
    setState: {
		catalog: bindActionCreators(allActions.catalog, dispatch),
	}
})
  

export default connect(mapStateToProps, mapDispatchToProps)(SpliderPreview);
