import { useState, useRef} from 'react'
import "./image-modal.scss"
import Preloader from '../Preloaders/Preloader'
import { NavLink } from 'react-router-dom'



interface IProps {
    url: string
    text?: string
    link?: {
        name: string,
        url: string
    }
}

const ImageModalNew: React.FC<IProps> = ({url, text='', link}): JSX.Element => {

	const [loaded, setLoaded] = useState(false);
	const img = useRef<HTMLImageElement>(null);

	const hasLoaded = () => {
		setLoaded(true)
	}


    return (
        <div className="image_modal">
            <div className="wrapper_img">
                {loaded || <Preloader />}
                <img ref={img} src={url} alt={text} onLoad={hasLoaded} style={{display: loaded ? "block" : "none"}} />
            </div>
            <div className="image_modal__text">
                {text.length > 0 && <span className="image_modal__text">{text}</span>}
                {link && 
                    <NavLink 
                        className="image_modal__link" 
                        to={link.url} 
                        rel="noopener noreferrer" 
                        aria-label={link.name}
                        >
                            {link.name}
                    </NavLink>
                }
            </div>
        </div>   
    )
}

export default ImageModalNew