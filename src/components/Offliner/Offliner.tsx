import { FC, useEffect, useState } from 'react'
import './offliner.scss'
import { TLang } from '../../interfaces'


interface IOffliner {
    lang: TLang
}


const Offliner: FC<IOffliner> =({lang}): JSX.Element => {

    const [offline, setOffline] = useState<boolean>(!navigator.onLine)

    const setStatus = () => {
        setOffline(!navigator.onLine)
    }

    useEffect(() => {
        window.addEventListener("online", setStatus)
        window.addEventListener("offline", setStatus)
        return () => {
            window.removeEventListener("online", setStatus)
            window.removeEventListener("offline", setStatus)
        }
    }, [])

    return (
        <div className="offliner" data-testid="offliner" onClick={() => setOffline(false)}>
            {offline && <span>{lang === 'en' ? 'You are offline (click to close)' : 'Вы не в сети (щелкните чтобы закрыть)'}</span>}
        </div>
    )
}

export default Offliner