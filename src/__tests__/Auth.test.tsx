import { act, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from '../redux/store';
import { setRes } from '../assets/js/testHelpers';
import Auth from '../components/Auth/Auth';
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk';
import fetchMock from 'jest-fetch-mock';
import dayjs from 'dayjs';


describe('Auth', () => {
    let _container: HTMLDivElement;
    let signal = new AbortController().signal
    const onCancelClick = jest.fn()

    beforeEach(() => {
        _container = document.createElement('div');
        _container.id = 'root'
        document.body.appendChild(_container);
        fetchMock.enableMocks()
        fetchMock.doMock()
    });

    afterEach(() => {
        document.body.removeChild(_container);
        fetchMock.resetMocks();
        fetchMock.disableMocks()
    });



    test('should close on cancel click', async () => {
        await act(async () => {
            createRoot(_container).render(
                <Provider store={store}>
                    <Auth onCancel={onCancelClick}/>
                </Provider>
            )
        })

        await act(() => setRes('sm', 1))    
        let _btnCancel: HTMLButtonElement | null = _container.querySelector("[data-testid='authBtnCancel']")
        await waitFor(() => {
            expect(_btnCancel).toBeInTheDocument()
        })
        await act(() => {
            _btnCancel?.click()
        })
        await waitFor(() => {
            expect(onCancelClick).toBeCalledTimes(1)
        })
    })



    test('should switch between register and login', async () => {
        await act(async () => {
            createRoot(_container).render(
                <Provider store={store}>
                    <Auth onCancel={onCancelClick}/>
                </Provider>
            )
        })

        await act(() => setRes('sm', 1))    
        let _toLogin: HTMLButtonElement | null = _container.querySelector("[data-testid='authBtnToLogin']")
        let _toRegister: HTMLButtonElement | null = _container.querySelector("[data-testid='authBtnToRegister']")
            
        await waitFor(() => {
            expect(_toLogin).toBeInTheDocument()
            expect(_toRegister).toBeInTheDocument()
            expect(_toRegister?.classList.contains('selected')).toBe(false)
            expect(_toLogin?.classList.contains('selected')).toBe(true)
            expect(_container?.querySelector("[name='name']")).not.toBeInTheDocument()
        })
        await act(() => {
            _toRegister?.click()
        })
        await waitFor(() => {
            expect(_toRegister?.classList.contains('selected')).toBe(true)
            expect(_toLogin?.classList.contains('selected')).toBe(false)
            expect(_container?.querySelector("[name='name']")).toBeInTheDocument()
        })
    })









    test('should create auth fetch action for login and register', async () => {
        const middlewares = [thunk];
        const mockStore = configureStore(middlewares);
        let mockedStore = mockStore(store.getState())
        mockedStore.clearActions()

        await act(async () => {
            createRoot(_container).render(
                <Provider store={mockedStore}>
                    <div>testo</div>
                    <Auth onCancel={onCancelClick}/>
                </Provider>
            )
        })

        await act(() => setRes('sm', 1))    

        let _email: HTMLInputElement = _container.querySelector("[name='email']") as HTMLInputElement
        let _pass: HTMLInputElement = _container.querySelector("[name='password']") as HTMLInputElement
        await waitFor(async () => {
            expect(_email).toBeInTheDocument()
            expect(_pass).toBeInTheDocument()
        })
        await act(() => {
            fireEvent.change(_email, { target: { value: 'testmail@gmail.com' } });
            fireEvent.change(_pass, { target: { value: '1234567890' } });
        })

        let _login: HTMLButtonElement | null = _container.querySelector("[data-testid='authBtnLogin']")
        await act(() => _login?.click())
        let dispatchedActions = mockedStore.getActions();
        expect(dispatchedActions.length).toBe(2)
        expect(dispatchedActions[0].type === 'SET_USER_AUTH' && dispatchedActions[0].payload.status === 'fetching').toBe(true)
        expect(dispatchedActions[1].type === 'SET_USER_AUTH' && dispatchedActions[1].payload.status === 'error').toBe(true)
        
        //register
        mockedStore.clearActions()
        let _toRegister: HTMLButtonElement | null = _container.querySelector("[data-testid='authBtnToRegister']")
        await act(() => {
            _toRegister?.click()
        })
        await waitFor(() => {})

        let _name: HTMLInputElement = _container.querySelector("[name='name']") as HTMLInputElement
        let _phone: HTMLInputElement = _container.querySelector("[name='phone']") as HTMLInputElement        
        let _repass: HTMLInputElement = _container.querySelector("[name='repassword']") as HTMLInputElement
        
        await act(() => {
            fireEvent.change(_email, { target: { value: 'testmail@gmail.com' } });
            fireEvent.change(_name, { target: { value: 'TestName' } });
            fireEvent.change(_phone, { target: { value: '+32223332' } });
            fireEvent.change(_pass, { target: { value: '1234567890' } });
            fireEvent.change(_repass, { target: { value: '1234567890' } });
            _login?.click()
        })


        expect(dispatchedActions.length).toBe(2)
        expect(dispatchedActions[0].type === 'SET_USER_AUTH' && dispatchedActions[0].payload.status === 'fetching').toBe(true)
        expect(dispatchedActions[1].type === 'SET_USER_AUTH' && dispatchedActions[1].payload.status === 'error').toBe(true)
    })




    

    test('should try login using inputs data and get error', async () => {
        fetchMock.mockOnce(JSON.stringify({ 
            message: { en: 'User not found', ru: "Пользователь не найден"},  
            errors: [{ en: 'User not found', ru: "Пользователь не найден"}]
        }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
        });

        await act(async () => {
            createRoot(_container).render(
                <Provider store={store}>
                    <Auth onCancel={onCancelClick}/>
                </Provider>
            )
        })

        await act(() => {setRes('sm', 1)})    

        let _email: HTMLInputElement = _container.querySelector("[name='email']") as HTMLInputElement
        let _pass: HTMLInputElement = _container.querySelector("[name='password']") as HTMLInputElement
        await act(() => {
            fireEvent.change(_email, { target: { value: 'testmail@gmail.com' } });
            fireEvent.change(_pass, { target: { value: '1234567890' } });
        })
        let _login: HTMLButtonElement | null = _container.querySelector("[data-testid='authBtnLogin']")
        await act(() => {
            _login?.click()
        })

        
        await waitFor(async () => {
            expect(fetchMock.mock.calls.length).toBe(1)
            expect(fetchMock).toHaveBeenCalledWith('host/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'testmail@gmail.com', password: `1234567890`}),
                signal
            });
            let errors = await store.getState().user.auth.errors
            expect(errors?.length).toBe(1)
        })
        
        await act(() => {
            let _errors = _container.querySelector("[data-testid='authErrorsContainer'] > ul > li")
            expect(_errors?.innerHTML).toBe('Пользователь не найден')
        })

    })






    test('should try register using inputs data and get error', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ 
            message: { en: 'User already exists', ru: "Такой пользователь уже существует"},  
            errors: [{ en: 'User already exists', ru: "Такой пользователь уже существует"}]
        }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
        });


        await act(async () => {
            createRoot(_container).render(
                <Provider store={store}>
                    <Auth onCancel={onCancelClick}/>
                </Provider>
            )
        })

        await act(() => {setRes('sm', 1)})    
        let _toRegister: HTMLButtonElement | null = _container.querySelector("[data-testid='authBtnToRegister']")
        await act(() => {
            _toRegister?.click()
        })
        await waitFor(() => {})

        let _email: HTMLInputElement = _container.querySelector("[name='email']") as HTMLInputElement
        let _name: HTMLInputElement = _container.querySelector("[name='name']") as HTMLInputElement
        let _phone: HTMLInputElement = _container.querySelector("[name='phone']") as HTMLInputElement
        let _pass: HTMLInputElement = _container.querySelector("[name='password']") as HTMLInputElement
        let _repass: HTMLInputElement = _container.querySelector("[name='repassword']") as HTMLInputElement
        
        await act(() => {
            fireEvent.change(_email, { target: { value: 'testmail@gmail.com' } });
            fireEvent.change(_name, { target: { value: 'TestName' } });
            fireEvent.change(_phone, { target: { value: '+32223332' } });
            fireEvent.change(_pass, { target: { value: '1234567890' } });
            fireEvent.change(_repass, { target: { value: '1234567890' } });
        })
        let _login: HTMLButtonElement | null = _container.querySelector("[data-testid='authBtnLogin']")
        await act(() => {
            _login?.click()
        })
        

        
        
        await waitFor(async () => {
            expect(fetchMock.mock.calls.length).toBe(1)
            expect(fetchMock).toHaveBeenCalledWith('host/api/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: 'TestName',
                    email: 'testmail@gmail.com', 
                    phone: '+32223332',
                    password: `1234567890`,
                    localDate: dayjs().format('YYYY-MM-DD')
                }),
                signal
            });
            let errors = await store.getState().user.auth.errors
            expect(errors?.length).toBe(1)
            let _errors = _container.querySelector("[data-testid='authErrorsContainer'] > ul > li")
            expect(_errors?.innerHTML).toBe('Такой пользователь уже существует')
        })

    })


})