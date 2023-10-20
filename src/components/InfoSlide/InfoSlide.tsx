import './info-slide.scss'

interface IProps {
    text: string
    link: string
}

const InfoSlide: React.FC<IProps> = ({text, link}) => {

    const linkToPage = <a target='_blank' href={link} rel="noreferrer">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
			<polyline points="15 3 21 3 21 9"></polyline>
			<line x1="10" y1="14" x2="21" y2="3"></line>
		</svg>
	</a>;

    return (
        <div className="info_slide">
            <div className="slide__descr">
                <p>{text}</p>
                {link && linkToPage}
            </div>
        </div>
    )
}

export default InfoSlide