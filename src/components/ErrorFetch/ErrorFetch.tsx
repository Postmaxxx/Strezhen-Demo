import { IFetch, TLang } from "../../interfaces"
import "./error-fetch.scss"

interface IProps {
    fetchData: IFetch
    lang: TLang
}

const ErrorFetch = ({fetchData, lang}: IProps) => {
    return (
        <p className="message_error">{fetchData.message[lang]}</p>
    )
}

export default ErrorFetch