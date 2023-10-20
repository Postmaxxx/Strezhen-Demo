import { IFetch, TLangText, IDispatch, IAction } from '../interfaces';
import { errorsChecker, ratingNumberToText, prevent, filesDownloader, filenameChanger, modalMessageCreator, deepCopy,resErrorFiller, checkIfNumbers, checkIfEmail, checkIfPhone, debounce, fetchError, focusMover, makeDelay, inputChecker } from '../assets/js/processors'
import { exceptionTimeout } from '../assets/js/consts';
import { AnyAction } from 'redux';
import { render } from '@testing-library/react';
import React from 'react'
import '@testing-library/jest-dom/extend-expect'

global.HTMLElement = window.HTMLElement;


describe('Tests for ratingNumberToText', () => {
    test('should return value out of range', () => {
        expect(ratingNumberToText('11', '3')).toEqual({en: 'Value out of range', ru: 'Значение вне диапазона'})
        expect(ratingNumberToText('0', '3')).toEqual({en: 'Value out of range', ru: 'Значение вне диапазона'})
    })

    test('should return for scale 3', () => {
        expect(ratingNumberToText('1', '3')).toEqual({en: 'none', ru: 'отсутствует'})
        expect(ratingNumberToText('3', '3')).toEqual({en: 'high', ru: 'высокая'})
    })
    
    test('should return for scale 5', () => {
        expect(ratingNumberToText('1', '5')).toEqual({en: 'low', ru: 'низкая'})
        expect(ratingNumberToText('4', '5')).toEqual({en: 'upper average', ru: 'выше средней'})
    })
    
    test('should return for scale 10', () => {
        expect(ratingNumberToText('10', '10')).toEqual({en: 'exellent',ru: 'отличная'})               
        expect(ratingNumberToText('2', '10')).toEqual({en: 'extremely low', ru: 'крайне низкая'})               

    })
})


describe('Tests for errorsChecker', () => {

    let e: ReturnType<typeof errorsChecker> 
    let r: ReturnType<typeof errorsChecker> 
    const errorsList = ['test string 1', 'test string 2', 'test string 3',]
    
    beforeEach(() => {
        e = errorsChecker({lang: 'en'})
        r = errorsChecker({lang: 'ru'})
        e.add(errorsList[0])
        e.add(errorsList[1])
        e.add(errorsList[2])
        r.add(errorsList[0])
        r.add(errorsList[1])
        r.add(errorsList[2])
    })

    test('should return correct length', () => {
        expect(e.amount()).toBe(3)
        e.clear()
        expect(e.amount()).toBe(0)
    })

    test('should return correct errors', () => {
        expect(e.result()).toEqual({
            header:'Errors was found',
            status: 'error',
            text: [...errorsList]
        })
        expect(r.result()).toEqual({
            header:'Найдены ошибки',
            status: 'error',
            text: [...errorsList]
        })
        e.add(errorsList[1])
        expect(e.result()).toEqual({
            header:'Errors was found',
            status: 'error',
            text: [...errorsList, errorsList[1]]
        })
        e.clear()
        expect(e.result()).toEqual({
            header:'Errors was found',
            status: 'error',
            text: []
        })
    })
})



describe('Tests for prevent', () => {
    test('should call preventDefault and stopPropagation for MouseEvent', () => {
        const mockEvent = {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
        } as unknown as React.MouseEvent<HTMLElement | HTMLButtonElement>;
    
        prevent(mockEvent);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    test('should call preventDefault and stopPropagation for ChangeEvent', () => {
        const mockEvent = {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
        } as unknown as React.ChangeEvent<HTMLInputElement>;
    
        prevent(mockEvent);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
});


describe('Tests for filesDownloader', () => {
    test('should return empty array', async () => {
        const result: File[] = await filesDownloader([''])
        expect(result).toEqual([])
    })
})




describe('Tests for filenameChanger', () => {
    const testString = '_test d.ts f._.-___  name_/__test2_3-_4_'
    test('should return array with "-" instead of "_"', () => {
        expect(filenameChanger(testString)).toBe('-test d.ts f.-.----  name-/--test2-3--4-')
    })
})




describe('Tests for fetchError', () => {
    let comp: TLangText
    let e: any
    let eNoName: any
    let controller: any

    const setter = <T extends IFetch>(payload: T):IAction<T> => ({
        type: 'setterActionType',
        payload
    });
    

    const dispatch: IDispatch = <T extends AnyAction>(action: T) => {
        return action;
    };

    beforeEach(() => {
        comp = {en: 'comp en', ru: 'comp ru'}
        e = {name: 'AbortError'} 
        eNoName = {}
        controller = {signal: {reason: {name: exceptionTimeout.name}}}
    }) 
    

    test('should return data for e.name === AbortError', () => {
        expect(fetchError({
            dispatch, setter, comp, e, controller
        })).toEqual({type: "setterActionType", payload: {status: 'error', message: {en: 'comp en: server response timeout', ru: "comp ru: таймаут ответа от сервера"}}})
        controller.signal.reason.name = 'otherReason'
        expect(fetchError({
            dispatch, setter, comp, e, controller
        })).toEqual({type: "setterActionType", payload: {status: 'error', message: {en: 'comp en: request aborted', ru: "comp ru: запрос отменен"}}})

    })



    test('should return data for e.name !== AbortError', () => {
        expect(fetchError({
            dispatch, setter, comp, e: {name: 'testError'}, controller
        })).toEqual({type: "setterActionType", payload: {status: 'error', message: {en: 'comp en: testError', ru: "comp ru: testError"}}})
    })

})




describe('Tests for modalMessageFromCreator', () => {
    test('should return errors ru', () => {
        const sourceErr:IFetch = {
            status: 'error',
            message: {en: 'msg en', ru: 'msg ru'},
            errors: [{en: 'err en 1', ru: 'err ru 1'}, {en: 'err en 2', ru: 'err ru 2'}]
        }
        expect(modalMessageCreator(sourceErr, 'ru')).toEqual({
            header: 'Ошибка',
            status: sourceErr.status,
            text: ['msg ru', 'err ru 1', 'err ru 2']
        })
    })


    test('should return only message en', () => {
        const sourceErr:IFetch = {
            status: 'error',
            message: {en: 'msg en', ru: 'msg ru'},
        }
        expect(modalMessageCreator(sourceErr, 'en'))
            .toEqual({
                header: 'Error',
                status: sourceErr.status,
                text: ['msg en']
        })
    })


    test('should return success en', () => {
        const sourceSuccess:IFetch = {
            status: 'success',
            message: {en: 'msg en', ru: 'msg ru'},
            errors: [{en: 'err en 1', ru: 'err ru 1'}, {en: 'err en 2', ru: 'err ru 2'}]
        }
        expect(modalMessageCreator(sourceSuccess, 'en')).toEqual({
            header: 'Success',
            status: sourceSuccess.status,
            text: ['msg en', 'err en 1', 'err en 2']
        })
    })
})



describe('Tests for deepcopy', () => {
    let testObj: {}

    beforeEach(() => {
        testObj = {a: {b: {c: 'c', d: 'd'}, e: [{f: 'f', g: {h: 'h', i: [1, 2]}}]}}
    })

    test('should return deep copy', () => {
        expect(deepCopy(testObj)).toEqual({a: {b: {c: 'c', d: 'd'}, e: [{f: 'f', g: {h: 'h', i: [1, 2]}}]}})
    })

    
    test('should return different object', () => {
        expect(deepCopy(testObj)).not.toBe(testObj)
    })
})



describe('Tests for focusMover', () => {
    let focuserString: ReturnType<typeof focusMover> = focusMover()
    let focuserDOM: ReturnType<typeof focusMover> = focusMover()

    const Root = () => {
        return (
            <div id='root'>
                <div className="block_input" data-selector="input-block">
                    <textarea data-selector="input" id="text_1"></textarea>
                </div>
                <div className="block_input" data-selector="input-block">
                    <input data-selector="input" id="text_2" />
                </div>
                <div className="block_input" data-selector="input-block">
                    <input data-selector="input" id="text_3" />
                </div>
                <div className="block_input" data-selector="input-block">
                    <input data-selector="input" id="text_4" />
                </div>
            </div>
        )
    }
    
    beforeEach(() => {  
        document.body.innerHTML = `
            <div id='root'>
                <div class="block_input" data-selector="input-block">
                    <textarea data-selector="input" id="text_1"></textarea>
                </div>
                <div class="block_input" data-selector="input-block">
                    <input data-selector="input" id="text_2" />
                </div>
                <div class="block_input" data-selector="input-block">
                    <input data-selector="input" id="text_3" />
                </div>
                <div class="block_input" data-selector="input-block">
                    <input data-selector="input" id="text_4" />
                </div>
            </div>`
        focuserString.create({container: '#root', itemsSelector: '[data-selector="input"]'})
    })

    afterAll(() => {
        document.body.innerHTML = ``
    })
    
    
    test('clear() should clear focusMover, length() should return correct length. for container is string', () => {
        expect(focuserString.length()).toBe(4)
        focuserString.clear()
        expect(focuserString.length()).toBe(0)
    });



    test('clear() should clear focusMover length() should return correct length for container is DOMElement', () => {
        let focuserDOM: ReturnType<typeof focusMover> = focusMover()
        focuserDOM.create({})
        expect(focuserDOM.length()).toBe(4)
        focuserDOM.clear()
        expect(focuserDOM.length()).toBe(0)
    });



    test('next() should focus next element', () => {
        let focusCount = 0
        const focused = () => { focusCount++ }

        const { container } = render(<Root />)
        const root = container.querySelector('#root') as HTMLElement
        focuserDOM.create({container: root, itemsSelector: '[data-selector="input"]'})
        const inputElements = [...root.querySelectorAll('[data-selector="input"]')] as HTMLInputElement[] | HTMLTextAreaElement[]
        inputElements.forEach(el => el.addEventListener('focus', focused))
        inputElements[0].focus() //select first input element
        expect(document.activeElement).toBe(inputElements[0])

        const mockEvent = {
            key: 'Enter',
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>

        focuserDOM.next(mockEvent)//stopPropagation = 1 preventDefault = 1
        expect(document.activeElement).not.toBe(inputElements[0])
        expect(document.activeElement).toBe(inputElements[1])
        focuserDOM.next(mockEvent) //stopPropagation = 2 preventDefault = 2
        focuserDOM.next(mockEvent)//stopPropagation = 3 preventDefault = 3
        focuserDOM.next(mockEvent)//stopPropagation = 4 preventDefault = 4
        expect(document.activeElement).toBe(inputElements[0])
        expect(focusCount).toBe(5) 
        focuserDOM.focusAll() //focus each element one time, first element selected
        expect(focusCount).toBe(9)
        focuserDOM.next(mockEvent) //the second element is selected, stopPropagation = 5 preventDefault = 5
        expect(focusCount).toBe(10) 

        focusCount = 0
        mockEvent.key = 'NotEnter'
        focuserDOM.next(mockEvent) //stopPropagation = 6
        expect(focusCount).toBe(0) 


        //check if list of elements is empty
        focuserDOM.clear()
        focuserDOM.next(mockEvent) //stopPropagation = 7
        focuserDOM.focusAll()
        expect(focusCount).toBe(0) 

        //check 1 element in list
        focuserDOM.clear()
        focuserDOM.create({container: root, itemsSelector: '#text_1'})
        expect(focusCount).toBe(0)
        focuserDOM.next(mockEvent) //stopPropagation = 8
        expect(focusCount).toBe(0)
        focuserDOM.focusAll()
        expect(focusCount).toBe(2)


        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(5)
        expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(8)
    });

})




describe('Tests for resErrorFiller', () => {

    let errors: TLangText[]
    let message: TLangText

    beforeEach(() => {
        errors = [{en: 'err 1 en', ru: 'error ru 1'}, {en: 'err 2 en', ru: 'error ru 2'}]
        message = {en: 'test message en', ru: 'test message ru'}
    })

    test('should return errors object', () => {
        expect(resErrorFiller({errors, message})).toEqual({
            status: 'error',
            message: {en: 'test message en', ru: 'test message ru'},
            errors: [{en: 'err 1 en', ru: 'error ru 1'}, {en: 'err 2 en', ru: 'error ru 2'}]
        })
    })

    test('should return empty array errors object', () => {
        expect(resErrorFiller({errors: [], message})).toEqual({
            status: 'error',
            message: {en: 'test message en', ru: 'test message ru'},
            errors: []
        })
        expect(resErrorFiller({message})).toEqual({
            status: 'error',
            message: {en: 'test message en', ru: 'test message ru'},
            errors: []
        })
    })


    test('should not return the same errors array', () => {
        expect(resErrorFiller({errors, message}).errors).not.toBe(errors)
    })

})




describe('Tests for checkIfNumbers', () => {
    test('should return false', () => {
        expect(checkIfNumbers('1234567890q1')).toBe(false)
        expect(checkIfNumbers('1234567890_')).toBe(false)
        expect(checkIfNumbers('+1234567890')).toBe(false)
        expect(checkIfNumbers('-1234567890')).toBe(false)
    })
    
    test('should return true', () => {
        expect(checkIfNumbers('01243205403254630560124902346')).toBe(true)
        expect(checkIfNumbers('0')).toBe(true)
        expect(checkIfNumbers('')).toBe(true)
    })
})



describe('Tests for checkIfPhone', () => {
    test('should return false', () => {
        expect(checkIfPhone('++1234567890')).toBe(false)
        expect(checkIfPhone('++1234567890a')).toBe(false)
        expect(checkIfPhone('1.34567890')).toBe(false)
        expect(checkIfPhone('1,34567890')).toBe(false)
    })
    
    test('should return true', () => {
        expect(checkIfPhone('01243205403254630560124902346')).toBe(true)
        expect(checkIfPhone('+01243205403254630')).toBe(true)
        expect(checkIfPhone('')).toBe(true)
    })
})


describe('Tests for checkIfEmail', () => {
    test('should return false', () => {
        expect(checkIfEmail('test@test.test.test.')).toBe(false)
        expect(checkIfEmail('')).toBe(false)
        expect(checkIfEmail('1@')).toBe(false)
        expect(checkIfEmail('1@1')).toBe(false)
        expect(checkIfEmail('1@1')).toBe(false)
        expect(checkIfEmail('1@1.')).toBe(false)
        expect(checkIfEmail('@sdfds.')).toBe(false)
        expect(checkIfEmail('@sdfds.fgdg')).toBe(false)
        expect(checkIfEmail('a@b.c')).toBe(false)
    })
    
    test('should return true', () => {
        expect(checkIfEmail('a@b.dsf')).toBe(true)
        expect(checkIfEmail('test@test.test.test.re')).toBe(true)
        expect(checkIfEmail('test.test.@gmail.com')).toBe(true)
    })
})





describe('Tests for debounce', () => {
    const mockCallback = jest.fn();
    
    beforeEach(() => {
        mockCallback.mockClear();
        jest.useFakeTimers();
    });
    
    afterEach(() => {
        jest.useRealTimers();
    });



    test('should debounce a function', () => {
        const debouncedFunction = debounce(mockCallback, 1000);

        debouncedFunction();
        debouncedFunction();
        debouncedFunction();

        jest.advanceTimersByTime(1000);

        expect(mockCallback).toHaveBeenCalledTimes(1);
    });



    test('should pass arguments to the debounced function', () => {
        const debouncedFunction = debounce(mockCallback, 1000);
        let argsList: any[] = [1, {a: 2}, 3]
        debouncedFunction(...argsList);

        jest.advanceTimersByTime(1000);

        expect(mockCallback).toHaveBeenCalledWith(...argsList);
    });



    test('should reset the debounce timer if called again within the delay', () => {
        const debouncedFunction = debounce(mockCallback, 1000);

        debouncedFunction();
        jest.advanceTimersByTime(500);
        debouncedFunction();
        jest.advanceTimersByTime(700);
        debouncedFunction();
        jest.advanceTimersByTime(1100);

        expect(mockCallback).toHaveBeenCalledTimes(1);
    });
});






describe('Tests for makeDelay', () => {

    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })


    test('should make delay 1000', async () => {
        const delay = 3000
        const promise = makeDelay(delay);
        jest.advanceTimersByTime(2999);
        expect(promise).not.toHaveProperty('value');
        jest.advanceTimersByTime(1);
        const result = await promise;
        expect(result).toBe(`Timeout ${delay}ms has been finished`);
    })
    
    test('should make delay 0', async () => {
        const promise = makeDelay(0);
        jest.advanceTimersByTime(0);
        const result = await promise;
        expect(result).toBe('Timeout 0ms has been finished')
    })

    test('should not make delay if delay not provided', async () => {
        const promise = makeDelay();
        jest.advanceTimersByTime(0);
        const result = await promise;
        expect(result).toBe('Timeout 0ms has been finished')
    })
})



describe('Tests for inputChecker', () => {

    let TestTree: () => JSX.Element


    beforeEach(() => {
        TestTree = () => {
            return (
                <div id='parent'>
                    <input type="text" id='input' />
                    <textarea name="textarea" id="textarea"></textarea>
                    <select id='select' defaultValue=''>
                        <option value="" disabled hidden></option>
                        <option value="123">123</option>
                        <option value="12345678910">12345678910</option>
                    </select>
                </div>
            )
        }
    })


    test('should do nothing if el.parent does not exist', () => {
        const singleInput = {parentElement: null} as HTMLInputElement
        expect(inputChecker({el: singleInput, lang: 'en'})).toBe('Parent missing')
    })



    test('should do nothing if el.value.length is 0 and orEmpty is true but to remove incorrect-value class for parent ', () => {
        const {container} = render(<TestTree />)
        const input = container.querySelector('#input') as HTMLInputElement
        const select = container.querySelector('#select') as HTMLSelectElement
        const textarea = container.querySelector('#textarea') as HTMLTextAreaElement
        const parent = container.querySelector('#parent') as HTMLElement
        parent.classList.add('incorrect-value')
        inputChecker({el: input, lang: 'en', orEmpty: true})
        expect(parent.classList.contains('incorrect-value')).toBe(false)

        parent.classList.add('incorrect-value')
        inputChecker({el: select, lang: 'en', orEmpty: true})
        expect(parent.classList.contains('incorrect-value')).toBe(false)

        parent.classList.add('incorrect-value')
        inputChecker({el: textarea, lang: 'en', orEmpty: true})
        expect(parent.classList.contains('incorrect-value')).toBe(false)
    })


    test('should add incorrect-value class for parent in value.length <min or >max', () => {
        const {container} = render(<TestTree />)
        const input = container.querySelector('#input') as HTMLInputElement
        const select = container.querySelector('#select') as HTMLSelectElement
        const textarea = container.querySelector('#textarea') as HTMLTextAreaElement
        const parent = container.querySelector('#parent') as HTMLElement
        inputChecker({el: input, lang: 'en', min: 1})
        expect(parent.classList.contains('incorrect-value')).toBe(true)
        expect(parent.dataset.errorText).toBe('Min length: 1')

        parent.classList.remove('incorrect-value')
        input.value = '123456789 10'
        inputChecker({el: input, lang: 'en', max: 10})
        expect(parent.classList.contains('incorrect-value')).toBe(true)
        expect(parent.dataset.errorText).toBe('Max length: 10')


        inputChecker({el: textarea, lang: 'en', min: 1})
        expect(parent.classList.contains('incorrect-value')).toBe(true)
        expect(parent.dataset.errorText).toBe('Min length: 1')
        parent.classList.remove('incorrect-value')
        textarea.value = '123456789 10'
        inputChecker({el: textarea, lang: 'en', max: 10})
        expect(parent.classList.contains('incorrect-value')).toBe(true)
        expect(parent.dataset.errorText).toBe('Max length: 10')

        
        inputChecker({el: select, lang: 'en', min: 1})
        expect(parent.classList.contains('incorrect-value')).toBe(true)
        expect(parent.dataset.errorText).toBe('Min length: 1')
        parent.classList.remove('incorrect-value')
        select.selectedIndex = 2
        inputChecker({el: select, lang: 'en', max: 10})
        expect(parent.classList.contains('incorrect-value')).toBe(true)
        expect(parent.dataset.errorText).toBe('Max length: 10')
    })


    test('should add incorrect-value class for exact and notExact', () => {
        const {container} = render(<TestTree />)
        const input = container.querySelector('#input') as HTMLInputElement
        const select = container.querySelector('#select') as HTMLSelectElement
        const parent = container.querySelector('#parent') as HTMLElement

        input.value = '1234'
        inputChecker({el: input, lang: 'en', exact:'123'})
        expect(parent.classList.contains('incorrect-value')).toBe(true)
        expect(parent.dataset.errorText).toBe("Doesn't match")
        parent.classList.remove('incorrect-value')
        input.value = '123'
        inputChecker({el: input, lang: 'en', exact:'123'})
        expect(parent.classList.contains('incorrect-value')).toBe(false)


        select.selectedIndex = 1
        inputChecker({el: select, lang: 'en', exact:'12345678910'})
        expect(parent.classList.contains('incorrect-value')).toBe(true)
        parent.classList.remove('incorrect-value')
        select.selectedIndex = 2
        inputChecker({el: select, lang: 'ru', exact:'12345678910'})
        expect(parent.classList.contains('incorrect-value')).toBe(false)
        expect(parent.dataset.errorText).toBe("Doesn't match")


        input.value = '1234'
        inputChecker({el: input, lang: 'en', notExact:'123'})
        expect(parent.classList.contains('incorrect-value')).toBe(false)
        parent.classList.remove('incorrect-value')
        input.value = '123'
        inputChecker({el: input, lang: 'en', notExact:'123'})
        expect(parent.classList.contains('incorrect-value')).toBe(true)
        expect(parent.dataset.errorText).toBe("Wrong value")
    })





    test('should check types', () => {
        const {container} = render(<TestTree />)
        const input = container.querySelector('#input') as HTMLInputElement
        const parent = container.querySelector('#parent') as HTMLElement

        input.value = '1234'
        inputChecker({el: input, lang: 'en', type: 'numbers'})
        expect(parent.classList.contains('incorrect-value')).toBe(false)
        parent.classList.remove('incorrect-value')
        input.value = '+1234'
        inputChecker({el: input, lang: 'en', type: 'numbers'})
        expect(parent.classList.contains('incorrect-value')).toBe(true)
        expect(parent.dataset.errorText).toBe("Numbers only")

        parent.classList.remove('incorrect-value')
        input.value = '+1234'
        inputChecker({el: input, lang: 'en', type: 'phone'})
        expect(parent.classList.contains('incorrect-value')).toBe(false)
        parent.classList.remove('incorrect-value')
        input.value = '+1234a'
        inputChecker({el: input, lang: 'en', type: 'phone'})
        expect(parent.classList.contains('incorrect-value')).toBe(true)
        expect(parent.dataset.errorText).toBe("Numbers only")

        parent.classList.remove('incorrect-value')
        input.value = '1@1.ca'
        inputChecker({el: input, lang: 'en', type: 'email'})
        expect(parent.classList.contains('incorrect-value')).toBe(false)
        parent.classList.remove('incorrect-value')
        input.value = '@.test'
        inputChecker({el: input, lang: 'en', type: 'email'})
        expect(parent.classList.contains('incorrect-value')).toBe(true)
        expect(parent.dataset.errorText).toBe("Wrong format")

        parent.classList.remove('incorrect-value')
        input.value = '2022-01-31'           
        inputChecker({el: input, lang: 'en', type: 'date'})
        expect(parent.classList.contains('incorrect-value')).toBe(false)
        parent.classList.remove('incorrect-value')
        input.value = '2022-01-32'       
        inputChecker({el: input, lang: 'en', type: 'date'})
        expect(parent.classList.contains('incorrect-value')).toBe(true)
        expect(parent.dataset.errorText).toBe("Wrong date")
        parent.classList.remove('incorrect-value')
        input.value = 'abc'       
        inputChecker({el: input, lang: 'en', type: 'date'})
        expect(parent.classList.contains('incorrect-value')).toBe(true)
        expect(parent.dataset.errorText).toBe("Wrong date")
        parent.classList.remove('incorrect-value')
        input.value = '2009-01-01'       
        inputChecker({el: input, lang: 'en', type: 'date'})
        expect(parent.classList.contains('incorrect-value')).toBe(true)
        expect(parent.dataset.errorText).toBe("Wrong date")
        parent.classList.remove('incorrect-value')
        input.value = '2039-01-01'       
        inputChecker({el: input, lang: 'en', type: 'date'})
        expect(parent.classList.contains('incorrect-value')).toBe(true)
        expect(parent.dataset.errorText).toBe("Wrong date")
    })
})