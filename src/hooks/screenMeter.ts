import { useState, useEffect } from 'react'

export const screenSizes = {
    xl: 1600,
    lg: 1241,
    md: 992,
    sm: 768,
    xs: 480,
}



interface IScreenMeter {
    xs: boolean
    sm: boolean
    md: boolean
    lg: boolean
    xl: boolean
}



const useScreenMeter = () => {
    const [resolutions, setResolutions] = useState<IScreenMeter>({xs: false, sm: false, md: false, lg: false, xl: false})
    
    const onResize = ()  => {
        setResolutions(prev => {
            const newResolutions = {...prev}
            Object.keys(screenSizes).forEach((key) => {
                newResolutions[key as keyof IScreenMeter] = window.innerWidth <= screenSizes[key as keyof IScreenMeter] ? true : false
            })
            return newResolutions
        })       
    }
    
    
    useEffect(() => {
        window.addEventListener("resize", onResize)
        onResize()
        return () => window.removeEventListener("resize", onResize)
    }, [])


    return resolutions
}

export default useScreenMeter