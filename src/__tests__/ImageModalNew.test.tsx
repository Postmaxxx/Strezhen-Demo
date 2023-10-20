import { act, screen } from '@testing-library/react';
import { HashRouter } from "react-router-dom";
import ImageModalNew from '../components/ImageModal/ImageModalNew';
import '@testing-library/jest-dom/extend-expect'
import { createRoot } from 'react-dom/client';


describe('ImageModalNew', () => {
    let _container: HTMLDivElement
    
    beforeEach(() => {
        _container = document.createElement('div');
        _container.id = 'root'
        document.body.appendChild(_container)
    })


    afterEach(() => {
        document.body.removeChild(_container)
    })


    test('should show content', async () => {
        let _root: ReturnType<typeof createRoot>
        await act(async () => {
            _root = createRoot(_container)
            _root.render(		    
                <HashRouter>
                    <ImageModalNew url='url_for_image' text='text_for_modal' link={{name:'link_name', url: 'link_url'}}/>
                </HashRouter>
            )
        });

        (global.window as any).location = {
            href: 'base',
            toString: () => {
              return (global.window as any).location.href;
            },
        };
        
        expect(screen.getByText('text_for_modal')).toBeInTheDocument()
        let _imageModal = _container.querySelector('.image_modal')
        expect(_imageModal).toBeInTheDocument()

        let _link = screen.getByText('link_name') as HTMLLinkElement
        expect(_link).toBeInTheDocument()
        expect(_link.href.includes('link_url')).toBe(true)

        let _wrapper = document.querySelector('.wrapper_img')
        expect(_wrapper).toBeInTheDocument()
        expect(_wrapper?.querySelector('.preloader')).toBeInTheDocument()
        _wrapper?.querySelector('img')
        expect(_wrapper?.querySelector('img')).toBeInTheDocument()
        expect(_wrapper?.querySelector('img')?.style.display).toBe('none'); 
        
    })


})