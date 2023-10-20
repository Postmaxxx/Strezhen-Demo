import { TLang, TLangText } from "../../interfaces"
import { useRef, useState, forwardRef, useImperativeHandle, useMemo } from "react";
import './selector.scss'
import { defaultSelectItem, empty } from "../../assets/js/consts";


export interface IItem {
    value: string
    name: TLangText
}


interface IProps {
    id: string
    lang: TLang
    label?: TLangText
    defaultData?: IItem
    data?: IItem[]
    onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void
    saveValue?: (e: React.ChangeEvent<HTMLSelectElement>) => void
    saveItem?: (itemNew: IItem) => void
    onClick?: (e: React.MouseEvent<HTMLSelectElement>) => void
}


export interface ISelectorFunctions {
    setData: (elements: IItem[]) => void;
    getValue: () => string;
    getItem: () => IItem;
    setItem: (element: IItem) => void;
    setValue: (value: string) => void;
}



const Selector = forwardRef<ISelectorFunctions, IProps>(({lang, id, label, defaultData={...defaultSelectItem}, data=[], onBlur, saveValue, saveItem,  onClick}, ref) => {
    useImperativeHandle(ref, () => ({
        setData(elements) {
            setStore(prev => ({...prev, items: elements}))
        },
        getItem() {
            return store.item
        },
        getValue() {
            return store.value
        },
        setItem(element) { //altough element can be not in items
            setStore(prev => ({...prev, item: element}))
        },
        setValue(value) { //select item if item.value === value
            setStore(prev => ({...prev, value: value}))
            if (!selectRef.current) return
            if (value) {
                selectRef.current.selectedIndex = store.items.findIndex(el => el.value === value) + 1  
            } else {
                selectRef.current.selectedIndex = 0
            }
        },
    }));


    interface IStore {
        items: IItem[]
        item: IItem,
        value: string
    }

    const [store, setStore] = useState<IStore>({items: data || [], item: defaultData || {value: '', name: {...empty}}, value: ''})
    const selectRef = useRef<HTMLSelectElement>(null)

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        var itemNew: IItem = {value: e.target.value, name: (store.items.find(el => el.value === e.target.value) as IItem)?.name || {en: '', ru: ''}}
        setStore(prev => {
            return {
                ...prev, 
                item: itemNew,
                value: e.target.value
            }
        })
        saveItem && saveItem(itemNew)
        saveValue && saveValue(e)
        e.target.parentElement?.classList.remove('incorrect-value') 
    }

     
    const options = useMemo(() => {
        return store.items.map((el, i) => <option key={i} value={el.value}>{el.name[lang]}</option>)
    }, [store.items, lang])
    
  

    return (
        <div className="selector block_input" data-selector="input-block">
            {label && <label htmlFor={id}>{label[lang]}</label>}
            <select 
                data-selector="select"
                ref={selectRef} 
                id={id} 
                defaultValue={store.value} 
                onChange={onChange} 
                onBlur={onBlur}
                onClick={(e) => {(e.target as HTMLElement).parentElement?.classList.remove('incorrect-value'); onClick && onClick(e)}}>
                    <option key={-1} value={store.item.value} disabled hidden>{store.item.name[lang]}</option>
                    {options}
            </select>
        </div>
    )
})


export default Selector