import { useRef } from 'react'
import './homer.scss'
import svgs from '../additional/svgs';



const Homer = () => {

    const _homer = useRef<HTMLDivElement>(null)


    window.onscroll = () => {
        scrollHomer()
    };

    function scrollHomer() {
        const show = document.body.scrollTop > 500 || document.documentElement.scrollTop > 500
        _homer.current?.classList.toggle("show", show);
    }

    const onHomerClicked = () => {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0;
    }

    


    return (
        <div className='homer' data-testid="homer" onClick={onHomerClicked} ref={_homer}>
            {svgs().iconHomer}
        </div>
    )
}


export default Homer