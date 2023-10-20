import { createRoot } from 'react-dom/client';
import { act, waitFor, screen } from '@testing-library/react';
import { HashRouter } from "react-router-dom";
import P404 from '../pages/P404/P404';
import '@testing-library/jest-dom/extend-expect'

describe('P404', () => {
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
                    <P404 lang='en'/>
                </HashRouter>
            )
        });

        (global.window as any).location = {
            href: 'no_exists_location',
            toString: () => {
              return (global.window as any).location.href;
            },
        };
        
        await waitFor(() => {
            let _p404 = document.querySelector('.page_404')       
            expect(_p404).toBeInTheDocument()
            expect(screen.getByText('Requested page was not found:')).toBeInTheDocument()
        })
    })


})