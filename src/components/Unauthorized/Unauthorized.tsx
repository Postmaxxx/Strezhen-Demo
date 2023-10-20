import { TLang } from "src/interfaces"
import './unauthorized.scss'

const Unauthorized = ({lang}: {lang: TLang}) => {
    return (
        <div className="unauthorized__container">
            <span>{lang === 'en' ? "You are not authorized. Please login to get premissions to see this page" : "Вы не авторизованы. Пожалуйста, войдите чтобы отобразить страницу"}</span>
        </div>
    )
}

export default Unauthorized