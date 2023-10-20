import { useLocation } from 'react-router-dom'
import './p404.scss'
import { TLang } from '../../interfaces'


interface IP404 {
    lang: TLang
}

const P404: React.FC<IP404> = ({lang}): JSX.Element => {
    const location = useLocation()

    return (
        <div className="page page_404">
            <div className="container">
                <h1>{lang === 'en' ? 'Requested page was not found' : 'Запрашиваемая страница не найдена'}:</h1>
                <h2>{location.pathname}</h2>
            </div>
        </div>
    )
}


export default P404