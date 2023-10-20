import { IMod, TLang } from '../../interfaces';
import './mods.scss'
import { useState, forwardRef, useImperativeHandle, useEffect  } from "react";
import { prevent } from '../../assets/js/processors';
import { empty } from '../../assets/js/consts';


interface IItem extends IMod {
    _id: string
}


interface IProps {
    lang: TLang
    type?: "input" | "textarea"
    amountChanged?: (newAmount: number) => void
    valueChanged?: (target: HTMLInputElement | HTMLTextAreaElement) => void
    onEnter?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}


export interface IModsFunctions {
    setMods: (items: IItem[]) => void;
    getMods: () => IItem[];
}



const Mods = forwardRef<IModsFunctions, IProps>(({lang, type="input", amountChanged, valueChanged, onEnter}, ref) => {
    useImperativeHandle(ref, () => ({
        setMods(items) {
            setMods(items || [])
        },
        getMods() {
            return mods
        }
    }));


    const [mods, setMods] = useState<IItem[]>([])

    const onEditMod = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
        e.target.parentElement?.classList.remove('error')
        setMods(prev => {
            const newMods = [...prev];
            if (e.target.name === 'en' || e.target.name === 'ru') {
                newMods[index].name[e.target.name as TLang] = e.target.value
            }
            if (e.target.name === 'weight' && !isNaN(+e.target.value)) {
                newMods[index].weight = +e.target.value
            }
            return newMods
        })
        valueChanged && valueChanged(e.target)
    }


    const onDeleteMod = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
        prevent(e)
        setMods(prev => {
            const newMods = [...prev];
            newMods.splice(index, 1)
            return newMods
        })
    }


    const onAddMod = (e: React.MouseEvent<HTMLButtonElement>) => {
        prevent(e)
        setMods(prev => [...prev, {_id: '', name: {...empty}, weight: 0}])
    }
    
    
    useEffect(() => {
        amountChanged && amountChanged(mods.length)
    }, [mods.length])


    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.stopPropagation()
        if (e.key === 'Enter') {
            e.preventDefault()
            onEnter && onEnter(e)
        }
    }


    return (
        <div className="mods">
            <div className="mods__list">
                {mods.map((item, i) => {
                    return (
                        <div className="block_mod full-width" key={i}>
                            <div className="block_input" data-selector="input-block">
                                <label>{lang === 'en' ? 'Value EN' : 'Значение EN'}</label>
                                {type === "input" ? 
                                    <input 
                                        data-selector="input"
                                        name="en" 
                                        type="text" 
                                        onChange={(e) => onEditMod(e, i)} 
                                        onKeyDown={onKeyDown}
                                        value={item.name.en}/>
                                :
                                    <textarea 
                                        data-selector="input"
                                        name="en" 
                                        onChange={(e) => onEditMod(e, i)} 
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
                                        onChange={(e) => onEditMod(e, i)} 
                                        value={item.name.ru}/>
                                :
                                    <textarea 
                                        data-selector="input"
                                        name="ru" 
                                        onKeyDown={onKeyDown}
                                        onChange={(e) => onEditMod(e, i)} 
                                        value={item.name.ru}/>
                                }
                            </div>
                            <div className="block_input" data-selector="input-block">
                                <label>{lang === 'en' ? 'Weight' : 'Вес'}</label>
                                <input 
                                    data-selector="input"
                                    name="weight" 
                                    type="text" 
                                    onKeyDown={onKeyDown}
                                    onChange={(e) => onEditMod(e, i)} 
                                    value={item.weight}/>
                            </div>
                            <button className="button_blue color_reverse button_mod_delete" onClick={(e) => {onDeleteMod(e, i)}}>X</button>
                        </div>
    
                    )
                })}
            </div>
            <button className='button_blue color_reverse button_mod_add' onClick={onAddMod}>{lang === 'en' ? '+' : '+'}</button>
        </div>
    )
})


export default Mods
    


