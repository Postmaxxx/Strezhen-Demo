import { IFiber, TLang } from '../../interfaces'
import './fiber-preview.scss'
import PicWithPreloader from '../../assets/js/PicWithPreloader'


interface IProps {
	fiber: IFiber
	lang: TLang
}

const FiberPreview = ({fiber, lang}: IProps) => {
    return (
        <div className="fiber">
            <div className="img-cont">
                <PicWithPreloader basePath={fiber.images.basePath} sizes={fiber.images.sizes} image={fiber.images.files[0]} alt={fiber.name[lang]}/>
            </div>
            <div className="fiber__info">
                <h3>{fiber.short.name[lang]}</h3>
                <span>{fiber.short.text[lang]}</span>
            </div>
        </div>
    )
}

export default FiberPreview