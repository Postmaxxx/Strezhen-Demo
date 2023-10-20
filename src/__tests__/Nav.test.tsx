import { act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from '../redux/store';
import Preloader from '../components/Preloaders/Preloader';
import { Suspense } from "react";
import App from '../App';
import { setRes } from '../assets/js/testHelpers';
import { allActions } from '../redux/actions/all';
import { actionsListUser } from '../redux/actions/actionsList';
import { IFetch, IUserState } from 'src/interfaces';


describe('Nav', () => {

    let _container: HTMLDivElement;


    beforeEach(() => {
        _container = document.createElement('div');
        _container.id = 'root'
        document.body.appendChild(_container);
    });



    afterEach(() => {
        document.body.removeChild(_container);
    });


    test('should render only one type of navigation', async () => {
		await act(async () => {
			createRoot(_container).render(
				<Provider store={store}>
					<Suspense fallback={<Preloader />}>
						<App />
					</Suspense>
				</Provider>)
		})
        await act(() => { //desktop
			setRes('sm', 1)
		})
        await waitFor(async () => {
            expect(_container.querySelector("[data-testid='nav_mobile']")).not.toBeInTheDocument()
            expect(_container.querySelector("[data-testid='nav_desktop']")).toBeInTheDocument()
        })

        await act(() => { //mobile
			setRes('sm')
		})
        await waitFor(async () => {
            expect(_container.querySelector("[data-testid='nav_mobile']")).toBeInTheDocument()
            expect(_container.querySelector("[data-testid='nav_desktop']")).not.toBeInTheDocument()
        })
    })


    test('desktop should be closed ond opened on click', async () => {
		await act(async () => {
			createRoot(_container).render(
				<Provider store={store}>
					<Suspense fallback={<Preloader />}>
						<App />
					</Suspense>
				</Provider>)
		})
        await act(() => { //desktop
			setRes('sm', 1)
		})
        let _nav = _container.querySelector("[data-testid='nav_desktop']")
        let _navSwitcher = _container.querySelector("[data-testid='nav_dt__checkbox']")
        await waitFor(async () => {
            expect(_navSwitcher).toBeInTheDocument()
            expect(_nav?.classList.contains('opened')).toBe(true) //by default
        })
        await act(() => {
            _navSwitcher?.dispatchEvent(new MouseEvent('click', {bubbles: true}))
        })
        await waitFor(async () => {
            expect(_nav?.classList.contains('opened')).toBe(false) 
        })
        await act(() => {
            _navSwitcher?.dispatchEvent(new MouseEvent('click', {bubbles: true}))
        })
        await waitFor(async () => {
            expect(_nav?.classList.contains('opened')).toBe(true) 
        })
    })


    test('mobile should be closed ond opened on click', async () => {
		await act(async () => {
			createRoot(_container).render(
				<Provider store={store}>
					<Suspense fallback={<Preloader />}>
						<App />
					</Suspense>
				</Provider>)
		})
        await act(() => { //desktop
			setRes('sm')
		})
        let _nav = _container.querySelector("[data-testid='nav_mobile']")
        let _navSwitcher = _container.querySelector("[data-testid='nav_mob__checkbox']")
        await waitFor(async () => {
            expect(_navSwitcher).toBeInTheDocument()
            expect(_nav?.classList.contains('opened')).toBe(false) //by default
        })
        await act(() => {
            _navSwitcher?.dispatchEvent(new MouseEvent('click', {bubbles: true}))
        })
        await waitFor(async () => {
            expect(_nav?.classList.contains('opened')).toBe(true) 
        })
        await act(() => {
            _navSwitcher?.dispatchEvent(new MouseEvent('click', {bubbles: true}))
        })
        await waitFor(async () => {
            expect(_nav?.classList.contains('opened')).toBe(false) 
        })
    })




    test('desktop should contain 5 items', async () => {
		await act(async () => {
			createRoot(_container).render(
				<Provider store={store}>
					<Suspense fallback={<Preloader />}>
						<App />
					</Suspense>
				</Provider>)
		})
        await act(() => { //desktop
			setRes('sm', 1)
		})
        await  waitFor(async () => {
            let _nav = _container.querySelector("[data-testid='nav_desktop']")
            expect(_nav?.querySelectorAll("[data-testid='navListDesktop'] > .nav-item")?.length).toBe(5)
        })
    })


    test('mobile should contain 5 items', async () => {
		await act(async () => {
			createRoot(_container).render(
				<Provider store={store}>
					<Suspense fallback={<Preloader />}>
						<App />
					</Suspense>
				</Provider>)
		})
        await act(() => { //desktop
			setRes('sm')
		})
        await waitFor(async () => {
            let _nav = _container.querySelector("[data-testid='nav_mobile']")
            expect(_nav?.querySelectorAll("[data-testid='navListMobile'] > .nav-item")?.length).toBe(5)
        })
    })




    test('desktop should have only one active item and item should be active on click on it', async () => {
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
        let _nav = _container.querySelector("[data-testid='nav_desktop']")
        let _navItems = _nav?.querySelectorAll("[data-testid='navListDesktop'] > .nav-item") || []
        await waitFor(async () => {
            expect(_navItems?.length).toBeGreaterThan(0)
            _navItems.forEach((item, i) => {
                if (i===0) {
                    expect(item.querySelector('.nav-text_level_1')?.classList.contains('selected')).toBe(true)
                } else {
                    expect(item.querySelector('.nav-text_level_1')?.classList.contains('selected')).toBe(false)
                }
            })
        })

        await act(async() => {
            let _secondItem: HTMLLinkElement | null = _navItems[3].querySelector('.nav-text_level_1') as HTMLLinkElement;
            _secondItem?.click()
            _secondItem?.dispatchEvent(new MouseEvent('click', {bubbles: true}))
        })


        _navItems.forEach((item, i) => {
            if (i===3) {
                expect(item.querySelector('.nav-text_level_1')?.classList.contains('selected')).toBe(true)
            } else {
                expect(item.querySelector('.nav-text_level_1')?.classList.contains('selected')).toBe(false)
            }
        })

    })



    test('mobile should have only one active item and item should be active on click on it', async () => {
		await act(async () => {
			createRoot(_container).render(
				<Provider store={store}>
					<Suspense fallback={<Preloader />}>
						<App />
					</Suspense>
				</Provider>)
		})
        await act(() => {
			setRes('sm')
		})
        let _nav = _container.querySelector("[data-testid='nav_mobile']")
        let _navItems = _nav?.querySelectorAll("[data-testid='navListMobile'] > .nav-item") || []
        expect(_navItems?.length).toBeGreaterThan(0)

        await act(() => {
            _navItems[0].querySelector('.nav-text_level_1')?.dispatchEvent(new MouseEvent('click', {bubbles: true}))
        })

        _navItems.forEach((item, i) => {
            if (i===0) {
                expect(item.querySelector('.nav-text_level_1')?.classList.contains('selected')).toBe(true)
            } else {
                expect(item.querySelector('.nav-text_level_1')?.classList.contains('selected')).toBe(false)
            }
        })
        
        //click on expandable item should not change selected
        let _inselectableItemIndex = [..._navItems].findIndex(item => item.querySelector(':scope > .nav-item__text'))
        let _inselectableItem = _navItems[_inselectableItemIndex]
        await act(() => { 
            _inselectableItem?.dispatchEvent(new MouseEvent('click', {bubbles: true}))
        })
        _navItems.forEach((item, i) => {
            if (i===0) {
                expect(item.querySelector('.nav-text_level_1')?.classList.contains('selected')).toBe(true)
            } else {
                expect(item.querySelector('.nav-text_level_1')?.classList.contains('selected')).toBe(false)
            }
        })


        //click on link item (not on already selected the first item) should change selected
        let newItemsList = [..._navItems]
        newItemsList.unshift()
        let _selectableItemIndex = newItemsList.findIndex(item => item.querySelector(':scope > a'))
        
        let _selectableItem = _navItems[_selectableItemIndex]
        await act(() => { 
            _selectableItem?.dispatchEvent(new MouseEvent('click', {bubbles: true}))
        })
        _navItems.forEach((item, i) => {
            if (i===_selectableItemIndex) {
                expect(item.querySelector('.nav-text_level_1')?.classList.contains('selected')).toBe(true)
            } else {
                expect(item.querySelector('.nav-text_level_1')?.classList.contains('selected')).toBe(false)
            }
        })
    })





    test('should create auth modal on login click for desktop and mobile', async () => {
        let _modalContainer: HTMLDivElement;

        await act(async () => {
            createRoot(_container).render(
                <Provider store={store}>
                    <Suspense fallback={<Preloader />}>
                        <App />
                    </Suspense>
                </Provider>
            )
        })
        _modalContainer = document.createElement('div');
        _modalContainer.id = 'modal'
        document.body.appendChild(_modalContainer);

        //desktop
        await act(() => setRes('sm', 1))       
        let _loginDt: HTMLLIElement | null = _container.querySelector("[data-testid='btn_login_desktop']")
        await waitFor(() => {
            expect(_loginDt).toBeInTheDocument()
        })

        await act(() => {
            _loginDt?.dispatchEvent(new MouseEvent('click', {bubbles: true}))
        })


        await waitFor(async () => {
            let name = await store.getState().base.modal.current?.getName()
            expect(name).toBe('auth')
        })
        let _modal = _modalContainer.querySelector("[data-testid='modal']")
        await waitFor(() => {
            expect(_modal).toBeInTheDocument()
            expect(_modal?.classList.contains('visible')).toBe(true)
        })




        //mobile
        await act(async () => {
            store.getState().base.modal.current?.closeAll()
        })
        await waitFor(async () => {
            let name = await store.getState().base.modal.current?.getName()
            expect(name).toBeNull()
        })
        await act(() => setRes('sm'))       
        let _loginMob: HTMLLIElement | null = _container.querySelector("[data-testid='btn_login_mobile']")
        await waitFor(() => {
            expect(_loginMob).toBeInTheDocument()
        })

        await act(() => {
            _loginMob?.dispatchEvent(new MouseEvent('click', {bubbles: true}))
        })


        await waitFor(async () => {
            let name = await store.getState().base.modal.current?.getName()
            expect(name).toBe('auth')
            _modal = _modalContainer.querySelector("[data-testid='modal']")
            expect(_modal).toBeInTheDocument()
            expect(_modal?.classList.contains('visible')).toBe(true)
        })

        document.body.removeChild(_modalContainer);
    })




    test('should logout on logout click for desktop', async () => {
        const originalReload = () => {
            window.location.reload()
        }

        await act(async () => {
            createRoot(_container).render(
                <Provider store={store}>
                    <Suspense fallback={<Preloader />}>
                        <App />
                    </Suspense>
                </Provider>
            )
        })

       
        await act(() => {
            setRes('sm', 1)
            store.dispatch(allActions.user.setUser({name: 'testname'}) as {type: keyof typeof actionsListUser, payload: Partial<IUserState>})
            store.dispatch(allActions.user.setAuth({status: 'success', message: {ru: '', en: ''}}) as {type: keyof typeof actionsListUser, payload: IFetch})
        })

        await waitFor(async () => {
            let name = await store.getState().user.name
            expect(name).toBe('testname')
        })

                
       
        let _logout: HTMLLIElement | null = _container.querySelector("[data-testid='btn_logout_desktop']")
        await waitFor(async () => {
            expect(_logout).toBeInTheDocument()
        })


        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {
                ...window.location,
                reload: jest.fn()
            }
        })

        await act(() => {
            _logout?.dispatchEvent(new MouseEvent('click', {bubbles: true}))
        })


        await waitFor(async () => {
            let name = await store.getState().user.name
            expect(name).toBe('')
            expect(window.location.reload).toBeCalledTimes(1)
        })

        
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {
                ...window.location,
                reload: originalReload()
            }
        })
    })




    test('should logout on logout click for mobile', async () => {
        const originalReload = () => {
            window.location.reload()
        }


        await act(async () => {
            createRoot(_container).render(
                <Provider store={store}>
                    <Suspense fallback={<Preloader />}>
                        <App />
                    </Suspense>
                </Provider>
            )
        })

       
        await act(() => {
            setRes('sm')
            store.dispatch(allActions.user.setUser({name: 'testname'}) as {type: keyof typeof actionsListUser, payload: Partial<IUserState>})
            store.dispatch(allActions.user.setAuth({status: 'success', message: {ru: '', en: ''}}) as {type: keyof typeof actionsListUser, payload: IFetch})

        })

        await waitFor(async () => {
            let name = await store.getState().user.name
            expect(name).toBe('testname')
        })

       
        let _logout: HTMLLIElement | null = _container.querySelector("[data-testid='btn_logout_mobile']")
        await waitFor(() => {
            expect(_logout).toBeInTheDocument()
        })


        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {
                ...window.location,
                reload: jest.fn()
            }
        })

        await act(() => {
            _logout?.dispatchEvent(new MouseEvent('click', {bubbles: true}))
        })

        await waitFor(async () => {
            let name = await store.getState().user.name
            expect(name).toBe('')
            expect(window.location.reload).toBeCalled()
        })

        
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {
                ...window.location,
                reload: originalReload()
            }
        })
    })



    test('should open subnav for mobile', async () => {
        await act(async () => {
            createRoot(_container).render(
                <Provider store={store}>
                    <Suspense fallback={<Preloader />}>
                        <App />
                    </Suspense>
                </Provider>
            )
        })

        await act(() => {
            setRes('sm')
        })
        let _navItem = _container.querySelector("[data-testid='navItemExpandable']")
        let _expander = _navItem?.querySelector(".nav-text_level_1")
        await waitFor(() => {
            expect(_navItem).toBeInTheDocument()
            expect(_navItem?.classList.contains('expanded')).toBe(false)
            expect(_expander).toBeInTheDocument()
        })


        await act(() => {
            _expander?.dispatchEvent(new MouseEvent('click', {bubbles: true}))
        })
        await waitFor(async () => {
            expect(_navItem?.classList.contains('expanded')).toBe(true)
        })

        await act(() => {
            _expander?.dispatchEvent(new MouseEvent('click', {bubbles: true}))
        })
        await waitFor(async () => {
            expect(_navItem?.classList.contains('expanded')).toBe(false)
        })
    })


})