import { createRoot } from 'react-dom/client';
import { act, waitFor, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux';
import store from '../redux/store';
import fetchMock from 'jest-fetch-mock';
import App from '../App';
import { setRes } from '../assets/js/testHelpers';
import ContactUs from '../pages/ContactUs/ContactUs';
import renderer from 'react-test-renderer'



describe('ContactUs', () => {
    let _container: HTMLDivElement;
    let _modalContainer: HTMLDivElement;

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






    test('should show content', async () => {
        await act(async () => {
            createRoot(_container).render(
                <Provider store={store}>
                    <App />
                </Provider>
            )
        })
        _modalContainer = document.createElement('div');
        _modalContainer.id = 'modal'
        document.body.appendChild(_modalContainer);

        fetchMock.mockResponseOnce(JSON.stringify({ 
            message: {message: {en: 'Message has been sent', ru: 'Сообщение было отправлено'}},  
        }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });


        await act(async () => {
            await setRes('sm', 1)
            screen.getByText('КОНТАКТЫ').click()
        })


        let _email: HTMLInputElement = _container.querySelector("#contacter_email") as HTMLInputElement
        let _name: HTMLInputElement = _container.querySelector("#contacter_name") as HTMLInputElement
        let _phone: HTMLInputElement = _container.querySelector("#contacter_phone") as HTMLInputElement
        let _message: HTMLTextAreaElement = _container.querySelector("#contacter_message") as HTMLTextAreaElement
        let _btnSend: HTMLTextAreaElement = screen.getByTestId('contactSendMessage') as HTMLTextAreaElement
        let _map: HTMLImageElement = screen.getByTestId('contactMapImg') as HTMLImageElement
        await waitFor(() => {
            expect(screen.getByTestId('contactHeader')).toBeInTheDocument()
            expect(screen.getByTestId('contactHeader')).toHaveTextContent('Свяжитесь с нами')
            expect(screen.getByTestId('contactSubheader')).toBeInTheDocument()
            expect(screen.getByTestId('contactSubheader')).toHaveTextContent('Компания Стрежень')
            expect(_map).toBeInTheDocument()
            expect(screen.getByTestId('mapLink')).toBeInTheDocument()
            expect((screen.getByTestId('mapLink') as HTMLLinkElement).href.includes('https://go.2gis.com')).toBe(true)
            expect(_email).toBeInTheDocument()
            expect(_name).toBeInTheDocument()
            expect(_phone).toBeInTheDocument()
            expect(_message).toBeInTheDocument()
        })
        
        await act(() => {
            _map.dispatchEvent(new MouseEvent('click', {bubbles: true}))
        })

        await waitFor(async () => {
            let modal = await store.getState().base.modal.current?.getName()
            expect(modal).toBe('location')
        })
        
        await act(() => {
            screen.getByTestId('modal-closer').click()
        })


        await act(() => {
            fireEvent.focus(_email)
            fireEvent.change(_email, { target: { value: 'testmail@gmail.com' } });
            fireEvent.blur(_email)
            fireEvent.focus(_name)
            fireEvent.change(_name, { target: { value: 'TestName' } });
            fireEvent.blur(_name)
            fireEvent.focus(_phone)
            fireEvent.change(_phone, { target: { value: '+322223332' } });
            fireEvent.blur(_phone)
            fireEvent.focus(_message)
            fireEvent.change(_message, { target: { value: 'test_message_with_length_more_than_20' }});
            fireEvent.blur(_message)
            fireEvent.click(_btnSend)
        })


        const sendForm = new FormData()
        sendForm.append('lang', 'ru')
        sendForm.append('message', 'text')


        let lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1]
        expect(lastCall[0]?.toString()).toBe('host/api/user/message')
        expect(lastCall[1]?.method).toBe('POST')
        expect(lastCall[1]?.headers).toEqual({enctype: 'multipart/form-data'})
        
        await waitFor(async () => {
            let modal = await store.getState().base.modal.current?.getName()
            expect(modal).toBe('messageSend')
        })

    })


    test('matches snapshots', async () => {
        let tree = renderer.create(
            <Provider store={store}>
                <ContactUs />
            </Provider>
        ).toJSON()
        expect(tree).toMatchSnapshot()
    })


})