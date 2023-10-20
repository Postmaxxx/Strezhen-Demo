import { act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from '../redux/store';
import Preloader from '../components/Preloaders/Preloader';
import { Suspense } from "react";
import App from '../App';
import { changeLang } from '../assets/js/testHelpers';




describe('Footer', () => {
    let _container: HTMLDivElement;

    beforeEach(() => {
        _container = document.createElement('div');
        _container.id = 'root'
        document.body.appendChild(_container);
    });


    afterEach(() => {
        document.body.removeChild(_container);
    });


    test('should exist, have 4 links and correct language', async () => {
		await act(async () => {
			createRoot(_container).render(
				<Provider store={store}>
					<Suspense fallback={<Preloader />}>
						<App />
					</Suspense>
				</Provider>)
		})
		
		let _footer = _container.querySelector("[data-testid='footer']")
		await waitFor(async () => {
			expect(_footer).toBeInTheDocument()
			expect(_footer?.querySelector('.footer__copyright')).toBeInTheDocument()
			expect(_footer?.querySelector('.footer__copyright')?.innerHTML).toMatch(/Стрежень/)
			expect(_footer?.querySelectorAll('a')).toHaveLength(4)
      let lang = await store.getState().base.lang
      expect(lang).toBe('ru')
		})
		await act(() => {
			changeLang(_container, act)
		})
		await waitFor(async () => {
			expect(_footer?.querySelector('.footer__copyright')?.innerHTML).toMatch(/Strezhen/)
		})

    })
})
