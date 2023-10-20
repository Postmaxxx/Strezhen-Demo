import { maxAmountToOrder } from '../../../src/assets/js/consts';
import { prevent } from '../../../src/assets/js/processors';
import { TLang } from '../../interfaces'
import './amount-changer.scss'
import { useEffect, useState } from "react";

interface IProps<T> {
    onChange: (idInstance: T, amount: number) => void
    idInstance : T
    lang: TLang,
    initialAmount : number
    reset?: {amount: number}
}

const AmountChanger = <T,>({idInstance, onChange, initialAmount, lang, reset}: IProps<T>): JSX.Element => {

    const [amount, setAmount] = useState<number>(initialAmount)

    
    const changeAmount = (newAmount: number) => {
        const amountToSet = newAmount >= 0 ? newAmount : 0
        setAmount(amountToSet)
        onChange(idInstance, amountToSet)
    }

    const onFocusOut = (newAmount: number) => {
        const amountToSet = newAmount > 0 ? newAmount : 1
        setAmount(amountToSet)
        onChange(idInstance, amountToSet)
    }

    useEffect(() => {
        if (reset) {
            setAmount(reset.amount)          
            onChange(idInstance, reset.amount)
        }
    }, [reset])


    const onDecreaseAmount = (e: React.MouseEvent<HTMLButtonElement>) => {
        prevent(e)
        amount < maxAmountToOrder && changeAmount(amount + 1)
    }

    const onIncreaseAmount = (e: React.MouseEvent<HTMLButtonElement>) => {
        prevent(e); 
        amount > 1 && changeAmount(amount > 2 ?  amount - 1 : 1)
    }

    const onCahngeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault(); 
        Number(e.target.value) <= maxAmountToOrder && changeAmount(Number(e.target.value))
    }

    return (
        <div className="amount-changer">
            <button className={`button_decrease ${amount <= 1 ? "disabled" : ''}`} aria-label={lang === 'en' ? 'Decrease amount' : 'Уменьшить количество'} onClick={onIncreaseAmount}>–</button>
            <input onBlur={(e) => onFocusOut(Number(e.target.value))} type="text" value={amount} onChange={onCahngeAmount} aria-label={lang === 'en' ? "Enter amount" : 'Введите количество'}/>
            <button className={`button_increase`} aria-label={lang === 'en' ? 'Increase amount' : 'Увеличить количество'} onClick={onDecreaseAmount}>+</button>
        </div>
    )
}


export default AmountChanger