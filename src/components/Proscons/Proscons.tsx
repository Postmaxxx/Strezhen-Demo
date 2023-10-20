import { TLang, TLangText } from '../../interfaces'
import './proscons.scss'

interface IProps {  
    pros: TLangText[]
    cons: TLangText[]
    lang: TLang
}

const Proscons = ({pros, cons, lang} : IProps) => {
    return (
        <div className="proscons">
            <ul className='pros'>
                {pros.length > 0 ? pros.map((item,i) => <li key={i}>{item[lang]}</li>) : null}
            </ul>
            <ul className='cons'>
                {cons.length > 0 ? cons.map((item,i) => <li key={i}>{item[lang]}</li>) : null}
            </ul>

        </div>
    )
}

export default Proscons