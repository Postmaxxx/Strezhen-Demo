import { TLang } from "../../interfaces";
import { screenSizes } from "../../hooks/screenMeter";

type res = 'xs' | 'sm' | 'md' | 'lg' | 'xl'


const setRes = async (res: res, addition: number = 0) => {
    global.innerWidth = screenSizes[res];
    global.innerWidth += addition || 0;
    global.dispatchEvent(new Event('resize'));
}


const changeLang = async (container: HTMLDivElement, act: (callback: () => void | undefined) => void) => {
    let langSwitcher = container.querySelector("[data-testid='lang-switcher']")
    act(() => {
        langSwitcher?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    });
}

export {setRes, changeLang}