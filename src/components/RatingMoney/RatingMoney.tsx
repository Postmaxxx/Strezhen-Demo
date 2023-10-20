import { useMemo } from 'react'
import './rating-money.scss'
import svgs from '../additional/svgs'

interface IRatingMoney {
    value: number
    max?: number
    text: string
    measurment: string
    fullFormat?: boolean
}

const RatingMoney: React.FC<IRatingMoney> = ({fullFormat=false, value, max=5, text, measurment}): JSX.Element => {
    const amount = fullFormat ? max : value

    const content = useMemo(() => {
        return Array(amount).fill('').map((item, i) => {
            return (
                <div className="img-cont" key={i}>
                    {svgs(i >= value ? "faded" : ``).iconMoney}
                </div>
            )
        })
    },[amount]) 


    return (
        <div className="rating_money">
            <div className="rating_money__content">
                {content}
             </div>
            <div className="rating_money__legend">
                <span>{text}<span>{measurment}</span></span>
            </div>
        </div>
    )
}


export default RatingMoney