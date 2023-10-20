import { waitFor, act  } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import ReactDOM from 'react-dom/client';
import Homer from '../components/Homer/Homer';



describe('Tests for Homer', () => {
    let _container: HTMLDivElement;

    beforeEach(() => {
        _container = document.createElement('div');
        _container.id = 'root'
        document.body.appendChild(_container);
        jest.restoreAllMocks();
    });

    afterEach(() => {
        document.body.removeChild(_container);
    });

     

    test('should exist and scroll page to top', async () => {
        await act(async () => {
            ReactDOM.createRoot(_container).render(<Homer />);
        })
        const _homer = _container.querySelector('.homer')
        await waitFor(() => {
            expect(_homer).toBeInTheDocument()
        })
        _homer?.classList.add('show')
        document.documentElement.scrollTop = 700
        document.body.scrollTop = 700

        await act(() => {
            _homer?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });
        await waitFor(() => {
            expect(document.documentElement.scrollTop).toBe(0)
            expect(document.body.scrollTop).toBe(0)
        })
    })

})
