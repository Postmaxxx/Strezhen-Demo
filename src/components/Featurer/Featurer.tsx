import { TLang, TLangText } from '../../interfaces';
import './featurer.scss'
import { useState, forwardRef, useImperativeHandle, useEffect  } from "react";
import { prevent } from '../../assets/js/processors';
import { empty } from '../../assets/js/consts';


interface IItem {
    _id: string
    name: TLangText
}


interface IProps {
    lang: TLang
    type?: "input" | "textarea"
    amountChanged?: (newAmount: number) => void
    valueChanged?: (target: HTMLInputElement | HTMLTextAreaElement) => void
    onEnter?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}


export interface IFeaturerFunctions {
    setFeatures: (items: IItem[]) => void;
    getFeatures: () => IItem[];
}



const Featurer = forwardRef<IFeaturerFunctions, IProps>(({lang, type="input", amountChanged, valueChanged, onEnter}, ref) => {
    useImperativeHandle(ref, () => ({
        setFeatures(items) {
            setFeatures(items || [])
        },
        getFeatures() {
            return features
        }
    }));


    const [features, setFeatures] = useState<IItem[]>([])

    const onEditFeature = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
        e.target.parentElement?.classList.remove('error')
        setFeatures(prev => {
            const newFeatures = [...prev];
            newFeatures[index].name[e.target.name as TLang] = e.target.value
            return newFeatures
        })
        valueChanged && valueChanged(e.target)
    }


    const onDeleteFeature = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
        prevent(e)
        setFeatures(prev => {
            const newFeatures = [...prev];
            newFeatures.splice(index, 1)
            return newFeatures
        })
    }


    const onAddFeature = (e: React.MouseEvent<HTMLButtonElement>) => {
        prevent(e)
        setFeatures(prev => [...prev, {_id: '', name: {...empty}}])
    }
    
    
    useEffect(() => {
        amountChanged && amountChanged(features.length)
    }, [features.length])


    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.stopPropagation()
        if (e.key === 'Enter') {
            e.preventDefault()
            onEnter && onEnter(e)
        }
    }


    return (
        <div className="features">
            <div className="features__list">
                {features.map((item, i) => {
                    return (
                        <div className="block_feature full-width" key={i}>
                            <div className="block_input" data-selector="input-block">
                                <label>{lang === 'en' ? 'Value EN' : 'Значение EN'}</label>
                                {type === "input" ? 
                                    <input 
                                        data-selector="input"
                                        name="en" 
                                        type="text" 
                                        onChange={(e) => onEditFeature(e, i)} 
                                        onKeyDown={onKeyDown}
                                        value={item.name.en}/>
                                :
                                    <textarea 
                                        data-selector="input"
                                        name="en" 
                                        onChange={(e) => onEditFeature(e, i)} 
                                        onKeyDown={onKeyDown}
                                        value={item.name.en}/>
                                }
                            </div>
                            <div className="block_input" data-selector="input-block">
                                <label>{lang === 'en' ? 'Value RU' : 'Значение RU'}</label>
                                {type === "input" ? 
                                    <input 
                                        data-selector="input"
                                        name="ru" 
                                        type="text" 
                                        onKeyDown={onKeyDown}
                                        onChange={(e) => onEditFeature(e, i)} 
                                        value={item.name.ru}/>
                                :
                                    <textarea 
                                        data-selector="input"
                                        name="ru" 
                                        onKeyDown={onKeyDown}
                                        onChange={(e) => onEditFeature(e, i)} 
                                        value={item.name.ru}/>
                                }
                            </div>
                            <button className="button_blue color_reverse button_feature_delete" onClick={(e) => {onDeleteFeature(e, i)}}>X</button>
                        </div>
    
                    )
                })}
            </div>
            <button className='button_blue color_reverse button_feature_add' onClick={onAddFeature}>{lang === 'en' ? '+' : '+'}</button>
        </div>
    )
})


export default Featurer
    


