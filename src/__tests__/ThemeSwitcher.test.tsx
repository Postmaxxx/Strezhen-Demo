import { act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from '../redux/store';
import Preloader from '../components/Preloaders/Preloader';
import { Suspense } from "react";
import App from '../App';
import { screenSizes } from '../hooks/screenMeter';



describe('Tests for ThemeSwitcher', () => {
    let _container: HTMLDivElement;
    let _themeSwitcher: HTMLDivElement | null

    beforeEach(() => {
        _container = document.createElement('div');
        _container.id = 'root'
        document.body.appendChild(_container);
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
			global.innerWidth = screenSizes.sm + 1;
			global.dispatchEvent(new Event('resize'));
		})
		_themeSwitcher = _container.querySelector("[data-testid='theme-switcher']")
		
		await waitFor(() => {
			expect(_themeSwitcher).toBeInTheDocument()
        })
		
		
		await act(() => {
			global.innerWidth = screenSizes.sm ;
			global.dispatchEvent(new Event('resize'));
		})

		_themeSwitcher = _container.querySelector("[data-testid='theme-switcher']")

		await waitFor(() => {
			expect(_themeSwitcher).toBeInTheDocument()
		})
    })




	test('should change theme on click', async () => {
		await act(async () => {
			createRoot(_container).render(
				<Provider store={store}>
					<Suspense fallback={<Preloader />}>
						<App />
					</Suspense>
				</Provider>)
		})


		// ------------------ screenSize > sm -------------------------------
		await act(async () => {
			global.innerWidth = screenSizes.sm + 1;
			global.dispatchEvent(new Event('resize'));
		})
        _themeSwitcher = _container.querySelector("#theme-switcher")
		await waitFor(async () => {
			let theme = await store.getState().base.theme
			expect(theme).toBe('dark') 
		})

		await act(() => { // to light
            _themeSwitcher?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });
		await waitFor(async () => {
			let theme = await store.getState().base.theme
			expect(theme).toBe('light') 
		})

		await act(() => { //to dark
            _themeSwitcher?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });
		await waitFor(async () => {
			let theme = await store.getState().base.theme
			expect(theme).toBe('dark') 
		})


		// ------------------ screenSize <= sm -------------------------------

		await act(async () => {
			global.innerWidth = screenSizes.sm;
			global.dispatchEvent(new Event('resize'));
		})
		await waitFor(async () => {
			let opened = await store.getState().base.mobOpened
			expect(opened).toBe(false) 
		})

		let _navOpenerCheckbox = _container.querySelector("[data-testid='nav_mob__checkbox']")
		await act(() => { 
			_navOpenerCheckbox?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });
		await waitFor(async () => {
			expect(_navOpenerCheckbox).toBeInTheDocument()
		})

		await act(() => { 
			expect(store.getState().base.mobOpened).toBe(true)
        });

		
		await waitFor(() => {
			_themeSwitcher = _container.querySelector("#theme-switcher")
			expect(_themeSwitcher).toBeInTheDocument()
		})

		await act(() => { // to light
            _themeSwitcher?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });
		expect(store.getState().base.theme).toBe('light')

		await act(() => { //to dark
            _themeSwitcher?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });

		await waitFor(async () => {
			let theme = await store.getState().base.theme
			expect(theme).toBe('dark') 
		})
    })


})

