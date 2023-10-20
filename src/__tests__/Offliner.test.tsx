import { act,waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import { createRoot } from 'react-dom/client';
import Offliner from '../components/Offliner/Offliner';
import '@testing-library/jest-dom/extend-expect'




describe('Offliner', () => {
    let _container: HTMLDivElement;
    let _offliner: HTMLDivElement | null

    beforeEach(() => {
        _container = document.createElement('div');
        _container.id = 'root'
        document.body.appendChild(_container);
        jest.restoreAllMocks();
    });

    afterEach(() => {
        document.body.removeChild(_container);
    });


    test('should exist', async () => {
        jest.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(true);
        await act(() => {
            createRoot(_container).render(<Offliner lang='en' />);
        });
        _offliner = _container.querySelector('.offliner')
        await waitFor(() => {
            expect(_offliner).toBeInTheDocument()
        })
    })

         
    test('should be hidden if online', async () => {
        jest.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(true);
        await act(() => {
            createRoot(_container).render(<Offliner lang='en' />);
        });
        _offliner = _container.querySelector('.offliner')
        waitFor(() => {
            expect(_offliner?.querySelector('span')).not.toBeInTheDocument()
        })
    })



    test('should be visible if offline', async () => {
        jest.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(false);
        await act(() => {
            createRoot(_container).render(<Offliner lang='en' />);
        });
        _offliner = _container.querySelector('.offliner')
        waitFor(() => {
            expect(_offliner?.querySelector('span')).toBeInTheDocument()
        })
    })



    test('should be hidden after click on it', async () => {
        jest.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(false);
        await act(() => {
            createRoot(_container).render(<Offliner lang='en' />);
        });
        _offliner = _container.querySelector('.offliner')
        await act(() => {
            _offliner?.dispatchEvent(new MouseEvent('click', {bubbles: true}))
        })
        waitFor(() => {
            expect(_offliner?.querySelector('span')).not.toBeInTheDocument()
        })
    })




    test('should remove eventListeners after unmount', async () => {
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
        const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
        let _root: ReturnType<typeof createRoot>
        await act(async () => {
            _root = createRoot(_container)
            _root.render(<Offliner lang='en' />)
        }) 
        waitFor(() => {
            expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledTimes(2)
        })

        await act(() => {
            _root.unmount()
        }) 
        waitFor(() => {
            expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledTimes(2)
        })
    })

})

