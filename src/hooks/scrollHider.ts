import { useState, useEffect } from 'react';


export const useScrollHider = () => {
    const [list, setList] = useState<{el: HTMLElement, threshold: number}[]>([])
   
    const onScroll = () => {   
        list.forEach(item => {
            const scrolled = document.body.scrollTop > item.threshold || document.documentElement.scrollTop > item.threshold
            item.el.classList.toggle('scrolled', scrolled)
        })
    }

    const add = (newEl: HTMLElement, threshold: number) => {
        setList(prev => [...prev, {el: newEl, threshold}])
    }

    const clear = () => {
        setList([])
    }


    useEffect(() => {       
        document.addEventListener('scroll', onScroll)
        return () => document.removeEventListener('scroll', onScroll)
    }, [list])

    
    return {add, clear}
}

