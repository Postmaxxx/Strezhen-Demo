import { act, waitFor, screen } from '@testing-library/react';
import { HashRouter } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect'
import { createRoot } from 'react-dom/client';
import MessageNew from '../components/Message/MessageNew';


describe('MessageNew', () => {
    let _container: HTMLDivElement
    let _root: ReturnType<typeof createRoot>

    beforeEach(() => {
        _container = document.createElement('div');
        _container.id = 'root'
        document.body.appendChild(_container)
    })


    afterEach(() => {
        document.body.removeChild(_container)
    })



    test('should has content', async () => {
        await act(async () => {
            _root = createRoot(_container)
            _root.render(		    
                <HashRouter>
                    <MessageNew header='header_text' text={['text_1', "text_2"]} status='test_status'/>
                </HashRouter>
            )
        });

        
        expect(screen.getByText('header_text')).toBeInTheDocument()
        expect(screen.getByText('text_1')).toBeInTheDocument()
        expect(screen.getByText('text_2')).toBeInTheDocument()
        let _imageModal = _container.querySelector('.message_modal')
        expect(_imageModal?.classList.contains('test_status')).toBe(true)       
    })





    test('should act on butons click', async () => {
        const btnAdd = jest.fn()
        const btnClose = jest.fn()

        await act(async () => {
            _root = createRoot(_container)
            _root.render(		    
                <HashRouter>
                    <MessageNew 
                        buttonAdd={{text: 'button_add', action:  btnAdd}}
                        buttonClose={{text: 'button_close', action:  btnClose}}/>
                </HashRouter>
            )
        });

        
        expect(screen.getByText('button_add')).toBeInTheDocument()
        expect(screen.getByText('button_close')).toBeInTheDocument()
        await act(() => {
            screen.getByText('button_add').click()
            screen.getByText('button_close').click()
        })
        await waitFor(() => {
            expect(btnAdd).toHaveBeenCalledTimes(1)
            expect(btnClose).toHaveBeenCalledTimes(1)
        })
  
    })


})