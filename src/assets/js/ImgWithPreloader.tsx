import { useRef, useState } from "react";
import Preloader from "../../components/Preloaders/Preloader";

interface IProps {
	src: string
	alt?: string
	id?: string
}


const ImgWithPreloader: React.FC<IProps> = ({src, alt, id}: IProps):JSX.Element => {

	const [loaded, setLoaded] = useState(false);
	const img = useRef<HTMLImageElement>(null);

	const hasLoaded = () => {
		setLoaded(true)
	}

	return (
		<>
			{loaded || <Preloader />}
			<img ref={img} src={src} alt={alt} onLoad={hasLoaded} style={{display: loaded ? "block" : "none"}} id={id} />
		</>
	);
};


export default ImgWithPreloader;