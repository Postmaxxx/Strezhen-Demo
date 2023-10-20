import './footer.scss'
import iconInstagram from "../../assets/img/logo_instagram.svg"
import iconVk from "../../assets/img/logo_vk.svg"
import iconTelegram from "../../assets/img/logo_telegram.svg"
import iconYoutube from "../../assets/img/logo_youtube.svg"
import { useMemo, FC } from 'react'
import { TLang } from '../../interfaces'
import { socials } from '../../../src/assets/js/consts'

interface IFooter {
    lang: TLang
}

const Footer: FC<IFooter>  = ({lang}):JSX.Element => {  
    const footerMemo = useMemo(() => {
        return (
            <footer data-testid="footer">
                <div className="container">
                    <div className="footer__content">
                        <span className='footer__copyright'>{lang === 'en' ? 'Strezhen' : 'Стрежень'} © 2023</span>
                        <div className="footer__social">
                            <span>{lang === 'en' ? "We are in socials" : "Мы в соцсетях"}: </span>
                            <div className="social__links">
                                <a href={socials.telegram}>
                                    <img src={iconTelegram} alt={lang === 'en' ? "Our Telegram" : 'Наш Telegram'} title={lang === 'en' ? "Join us in Telegram" : 'Присоединяйтесь к нам в Telegram'}/>
                                </a>
                                <a href={socials.vk}>
                                    <img src={iconVk} alt={lang === 'en' ? "Our VK" : 'Наш VK'} title={lang === 'en' ? "Join us in VK" : 'Присоединяйтесь к нам в VK'}/>
                                </a>
                                <a href={socials.instagram}>
                                    <img src={iconInstagram} alt={lang === 'en' ? "Our Instagram" : 'Наш Instagram'} title={lang === 'en' ? "Join us in Instagram" : 'Присоединяйтесь к нам в Instagram'}/>
                                </a>
                                <a href={socials.youtube}>
                                    <img src={iconYoutube} alt={lang === 'en' ? "Our Youtube" : 'Наш Youtube'} title={lang === 'en' ? "Join us in Youtube" : 'Присоединяйтесь к нам в Youtube'}/>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        )
    }, [lang])

    return footerMemo
}


export default Footer
