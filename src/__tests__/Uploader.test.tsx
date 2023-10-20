import { act, screen } from '@testing-library/react';
import { HashRouter } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect'
import { createRoot } from 'react-dom/client';
import Uploader from '../components/Preloaders/Uploader';


describe('Uploader', () => {
    let _container: HTMLDivElement
    let _root: ReturnType<typeof createRoot>

    beforeEach(() => {
        _container = document.createElement('div');
        _container.id = 'root'
        document.body.appendChild(_container)
    })


    afterEach(() => {
        document.body.removeChild(_container)
    })


    test('should has content', async () => {
        await act(async () => {
            _root = createRoot(_container)
            _root.render(		    
                <HashRouter>
                    <Uploader text='uploader_text'/>
                </HashRouter>
            )
        });

        
        expect(screen.getByText('uploader_text')).toBeInTheDocument()
        expect(_container.querySelector('.uploader__image')).toBeInTheDocument()
     
    })



})