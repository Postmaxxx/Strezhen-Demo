import svgs from '../additional/svgs'
import './svg-inserter.scss'

export type TSvgTypes = 'minus' | 'con' | 'pro' | 'plus' | 'question'

interface ISvgInserter {
    type: TSvgTypes
    color?: string

}


const SvgInserter: React.FC<ISvgInserter> = ({color, type}): JSX.Element => {
    let icon: JSX.Element
    
    switch (type) {
        case 'pro':
            icon = <svg className={`svg-icon ${type}`} version="1.1" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill={color ? color : '#41AD49'}>
                    <path d="M26.636 280.832l51.12-51.090 102.225 102.282-51.12 51.091-102.225-102.282z" />
                    <path d="M179.996 331.976l254.25-254.25 51.12 51.12-254.25 254.25-51.12-51.12z" />
                    <path d="M180.006 434.245l-51.141-51.141 51.12-51.12 51.141 51.141-51.119 51.12z" />
                </svg>
            break;
        case 'con':
            icon = <svg className={`svg-icon ${type}`} version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 174.239 174.239" xmlSpace="preserve" fill={color ? color : '#FF0000'}>
                    <path d="M146.537,1.047c-1.396-1.396-3.681-1.396-5.077,0L89.658,52.849c-1.396,1.396-3.681,1.396-5.077,0L32.78,1.047 
                            c-1.396-1.396-3.681-1.396-5.077,0L1.047,27.702c-1.396,1.396-1.396,3.681,0,5.077l51.802,51.802c1.396,1.396,1.396,3.681,0,5.077
                        L1.047,141.46c-1.396,1.396-1.396,3.681,0,5.077l26.655,26.655c1.396,1.396,3.681,1.396,5.077,0l51.802-51.802
                        c1.396-1.396,3.681-1.396,5.077,0l51.801,51.801c1.396,1.396,3.681,1.396,5.077,0l26.655-26.655c1.396-1.396,1.396-3.681,0-5.077
                        l-51.801-51.801c-1.396-1.396-1.396-3.681,0-5.077l51.801-51.801c1.396-1.396,1.396-3.681,0-5.077L146.537,1.047z"/>
                </svg>
            break;
        default:
            icon = <></>
            break;
    }

    return icon
}


export default SvgInserter