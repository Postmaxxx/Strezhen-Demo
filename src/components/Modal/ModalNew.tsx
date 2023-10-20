import './modal.scss'
import { createPortal } from 'react-dom';
import { useState, forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import svgs from '../additional/svgs';



interface IProps {}

export interface IModal {
    name?: string
    closable?: boolean
    onClose?: () => void
    children: React.ReactNode
    closeOnEsc?: boolean
}
export interface IModalFunctions {
    openModal: ({name, onClose, closable, children, closeOnEsc}: IModal) => void;
    closeCurrent: () => void; //close current modal, current modal = modals[0]
    closeName: (name: string) => void; //close all modals with the specified name
    getName: () => Promise<string | null>//get name of current visible modal
    closeAll: () => void//close all modals
    contentChanged: () => void//close all modals
}




const ModalNew = forwardRef<IModalFunctions, IProps>(({}, ref) => {
    useImperativeHandle(ref, () => ({
        openModal({name, closable=true, onClose, closeOnEsc=true, children}) { 
            setModals(prev => ([...prev, {
                name: name || '',
                closable,
                closeOnEsc,
                onClose: onClose ? onClose : close,
                children
            }]))
        },
        closeCurrent() {            
            setModals(prev => prev.slice(1))
        },
        closeName(name) {
            setModals(prev => prev.filter(modal => modal.name !== name))
        },
        getName() {
            return new Promise<string | null>((res) => {
                setModals(prev => {
                    prev[0] ? res(prev[0]?.name || '') : res(null)                   
                    return prev
                })
            }) 
        },
        closeAll() {
            setModals([])
        },
        contentChanged() {
            contentChanged()
        },
    }));


    const [modals, setModals] = useState<IModal[]>([])
    const _modal = document.getElementById('modal') as HTMLElement;
    const focusableEls = useRef<HTMLElement[]>([])
    const _prevFocusedEl = useRef<any>(null)
    const selected = useRef<number>(0)
    const _content = useRef<HTMLDivElement>(null)

    const close = () => {
        setModals(prev => prev.slice(1))
    }




    const getSelectable = (_parent: HTMLElement | null) => {
        if (!_parent) return []
        const selectableElements = 'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
        return Array
            .from(_content.current?.querySelectorAll(selectableElements) || [])
            .filter(
                el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
            ) as HTMLElement[]
        
    }



    const contentChanged = () => {
        focusableEls.current = getSelectable(_content.current)
        console.log('OPA');
        console.log(focusableEls.current);
    }




    const keyPressed = (e: KeyboardEvent) => {
        if (e.code === 'Escape' && modals[0].closeOnEsc) {
            return setModals(prev => prev.slice(1))
        }
        if (e.code !== 'Tab') return
        e.preventDefault();
        if (!e.shiftKey) {
            selected.current++
            (selected.current > focusableEls.current.length - 1) && (selected.current = 0)
        }
        if (e.shiftKey) {
            selected.current--
            (selected.current < 0) && (selected.current = focusableEls.current.length - 1)
        }
        focusableEls.current[selected.current].focus()
        e.stopPropagation()
    };



    useEffect(() => {
        _prevFocusedEl.current = document.activeElement
        if (!modals[0]?.children) return
        selected.current = 0
        focusableEls.current = getSelectable(_content.current)
        console.log(focusableEls.current);
        
        document.addEventListener("keydown", keyPressed);
        return () => {
            document.removeEventListener("keydown", keyPressed);
           _prevFocusedEl.current.focus()
        }
        
    }, [modals[0]?.children])
    



    return _modal ? createPortal(
        <div className={`modal-window ${modals.length > 0 ? "visible" : ""}`} data-testid='modal' ref={_content}>
            {modals[0]?.closable &&
            <button className="closer" aria-label='close | закрыть' onClick={modals[0]?.onClose ? modals[0]?.onClose : close} data-testid='modal-closer'>
                {svgs().iconClose}
            </button>}

			<div className="modal__content">
                {modals[0]?.children}
            </div>
        </div>,
        _modal    
    ) 
    :
    <div className="modal-window_absence">
        Node for modal windows was not found
    </div>

})


export default ModalNew;

