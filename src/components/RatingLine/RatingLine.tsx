import { useEffect, useRef } from "react"
import './rating-line.scss'

interface IRatingLine {
    colorValue?: string
    value: number
    min?: number
    max?: number
    text: string
    measurment?: string
}

const RatingLine: React.FC<IRatingLine> = ({colorValue='', value=0, min=0, max=10, text='', measurment=''}): JSX.Element => {
    const _rating = useRef<HTMLDivElement>(null)
    const _value = useRef<HTMLDivElement>(null)


    useEffect(() => {
        if (!_rating.current || !_value.current) return
        //const percent = 100 * value / (max-min);
        const percent = 100 * (value-min) / (max-min);
        _value.current.style.width = `${percent}%`;
    }, [])

    return (
        <div className="rating_line" ref={_rating}>
            <div className="rating_line__line">
                <div className={`rating_line__value ${colorValue ? `color_${colorValue}` : ''}`} ref={_value}></div>
                <div className="border_inner border_inner_1"></div>
                <div className="border_inner border_inner_2"></div>
                <div className="border_inner border_inner_3"></div>
                <div className="border_inner border_inner_4"></div>
            </div>


            <div className="rating_line__legend">
                <span>{text}<span>{measurment}</span></span>
            </div>
        </div>
    )
}


export default RatingLine