import './color-selector.scss'
import { IColor, TLang } from "../../interfaces";
import { useState } from 'react'
import { IModalFunctions } from '../Modal/ModalNew';
import ImageModalNew from '../ImageModal/ImageModalNew';
import { useEffect } from 'react'
import svgs from '../additional/svgs';


interface IPropsState {
    colors: IColor[]
    lang: TLang
    onSelect: (id: IColor['_id']) => void
    modal: IModalFunctions | null
}


const ColorSelector: React.FC<IPropsState> = ({lang, modal, colors, onSelect}): JSX.Element => {
    const [currentColor, setCurrentColor] = useState<IColor>()
    const [expanded, setExpanded] = useState<boolean>(false)

    useEffect(() => {
        setCurrentColor(undefined)
    }, [colors])

    
    const onCurrentClick = () => {
        setExpanded(prev => !prev)
    }

    const onOptionClick = (id: IColor['_id']) => {
        setCurrentColor(colors.find(color => color._id === id))
        setExpanded(false)
        onSelect(id)
    }


    const onImageClick = (e: React.MouseEvent | React.KeyboardEvent , color: IColor) => {
        e.stopPropagation()
        modal?.openModal({
            name: 'colorSelector',
            children: <ImageModalNew url={color.urls.full}/>
        })
    }




    return (
        <div className="selector block_input">
            <label>{lang === 'en' ? 'Color' : 'Цвет'}: </label>
            <div className={`selector_color ${expanded ? 'expanded' : ''}`}>
                <div className="color current" onClick={onCurrentClick} tabIndex={0} onKeyDown={e => {e.code === 'Enter' && onCurrentClick()}}>
                    {currentColor ? 
                        <>
                            <div className="img-cont">
                                <img src={currentColor.urls.thumb} alt={currentColor.name[lang]} />
                            </div>
                            <span>{currentColor.name[lang]}</span>
                        </>
                        :
                        <span>{lang === 'en' ? 'Choose the color' : 'Выберите цвет'} </span>
                    }
                </div>
                <div className='list'>
                    {colors.map(color => {
                        return (
                            <div 
                                className="color" 
                                key={color._id} 
                                onClick={() => onOptionClick(color._id)} 
                                tabIndex={expanded ? 0 : -1} 
                                onKeyDown={e => {e.code === 'Enter' && onOptionClick(color._id)}}
                            >
                                <div 
                                    className="img-cont" 
                                    onClick={(e) => onImageClick(e, color)} 
                                    tabIndex={expanded ? 0 : -1} 
                                    onKeyDown={e => {e.code === 'Enter' && onImageClick(e, color)}}
                                >
                                    <img src={color.urls.thumb} alt={color.name[lang]} />
                                    {svgs().iconExpand}
                                </div>
                                <span className='color__name'>{color.name[lang]}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>

    )


}


export default ColorSelector;
