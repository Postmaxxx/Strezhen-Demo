import { act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from '../redux/store';
import Preloader from '../components/Preloaders/Preloader';
import { Suspense } from "react";
import App from '../App';
import { setRes } from '../assets/js/testHelpers';





describe('LangSwitcher', () => {

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


    test('should exist if screen.width > sm and <=sm', async () => {
		await act(async () => {
			createRoot(_container).render(
				<Provider store={store}>
					<Suspense fallback={<Preloader />}>
						<App />
					</Suspense>
				</Provider>)
		})
		
		await act(() => {
			setRes('sm', 1)
		})
		
		let _langSwitcher = _container.querySelector("[data-testid='lang-switcher']")
		await waitFor(() => {
			expect(_langSwitcher).toBeInTheDocument()
        })
		
		
		await act(() => {
			setRes('sm')
		})

		_langSwitcher = _container.querySelector("[data-testid='lang-switcher']")
		await waitFor(() => {
			expect(_langSwitcher).toBeInTheDocument()
		})

    })




	test('should change language on click', async () => {
		await act(async () => {
			createRoot(_container).render(
				<Provider store={store}>
					<Suspense fallback={<Preloader />}>
						<App />
					</Suspense>
				</Provider>)
		})
		// ------------------ screenSize > sm -------------------------------
		await act(() => {
			setRes('sm', 1)
		})
        let _langSwitcher = _container.querySelector("[data-testid='lang-switcher']")
		waitFor(() => {
			expect(store.getState().base.lang).toBe('ru')
        })
		await act(() => { // to en
            _langSwitcher?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });
		waitFor(() => {
			expect(store.getState().base.lang).toBe('en')
        })
		await act(() => { //to ru
            _langSwitcher?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });
		waitFor(() => {
			expect(store.getState().base.lang).toBe('ru')
        })

		// ------------------ screenSize <= sm -------------------------------

		await act(() => {
			setRes('sm')
		})

		let navOpenerCheckbox = _container.querySelector("[data-testid='nav_mob__checkbox']")
        waitFor(() => {
			expect(store.getState().base.lang).toBe('ru')
			expect(store.getState().base.mobOpened).toBe(false)
			expect(navOpenerCheckbox).toBeInTheDocument()
        })

		await act(() => { 
			navOpenerCheckbox?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });

		waitFor(() => {
			expect(store.getState().base.mobOpened).toBe(true)
			_langSwitcher = _container.querySelector("[data-testid='lang-switcher']")
			expect(_langSwitcher).toBeInTheDocument()
			_langSwitcher = _container.querySelector("[data-testid='lang-switcher']")
			expect(_langSwitcher).toBeInTheDocument()
        })


		await act(() => { // to en
            _langSwitcher?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });

		waitFor(() => {
			expect(store.getState().base.lang).toBe('en')
        })

		await act(() => { //to ru
            _langSwitcher?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });
		waitFor(() => {
			expect(store.getState().base.lang).toBe('ru')
        })
    })
})
