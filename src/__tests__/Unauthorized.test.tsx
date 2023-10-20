import { createRoot } from 'react-dom/client';
import { act, waitFor, screen } from '@testing-library/react';
import { HashRouter } from "react-router-dom";
import Unauthorized from '../components/Unauthorized/Unauthorized';

describe('Unauthorized', () => {
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
                    <Unauthorized lang='en'/>
                </HashRouter>
            )
        });

        (global.window as any).location = {
            href: 'no_exists_location',
            toString: () => {
              return (global.window as any).location.href;
            },
        };
        
        waitFor(() => {
            let _newsItem = document.querySelector('.unauthorized__container')       
            expect(_newsItem).toBeInTheDocument()
            expect(screen.getByText('You are not authorized. Please login to get premissions to see this page')).toBeInTheDocument()
        })
    })

})