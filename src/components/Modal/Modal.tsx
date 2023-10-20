import './modal.scss'
import { createPortal } from 'react-dom';
import { useEffect, useState, forwardRef, useImperativeHandle, memo } from 'react';

interface IProps {
    escExit: boolean
    onClose?: () => void
    children: React.ReactNode
}

export interface IModalFunctions {
    openModal: (owner?: string) => void;
    closeModal: () => void;
    getOwner: () => string;
}


const Modal = forwardRef<IModalFunctions, IProps>(({escExit, onClose, children}, ref) => {
    useImperativeHandle(ref, () => ({
        openModal(owner?) {
            open(owner || '')
        },
        closeModal() {
            close()
        },
        getOwner() {
            return owner
        },
    }));
    
    
    const _modal = document.getElementById('modal') as HTMLElement;
    const [visible, setVisible] = useState<boolean>(false)
    const [owner, setOwner] = useState<string>('')

    const modalKeyListener = (e: KeyboardEvent) => {
        if (onClose) {
            escExit && e.keyCode === 27 && onClose();
        } else {
            escExit && e.keyCode === 27 && close();
        }
    }


    useEffect(() => {
        document.addEventListener("keyup", modalKeyListener);
        return () => {document.removeEventListener("keyup", modalKeyListener)}
    }, [])



    const close = () => {
        setVisible(false)
    }

    
    const open = (owner: string) => {
        setVisible(true)
        setOwner(owner)
    }

    

    return _modal ? createPortal(
        <div className={visible ? "modal-window visible" : "modal-window"}>
            <button className="closer" aria-label='close | закрыть' onClick={onClose ? onClose : close}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" stroke="#979797" clipRule="evenodd" d="M16 31C24.2843 31 31 24.2843 31 16C31 7.71573 24.2843 1 16 1C7.71573 1 1 7.71573 1 16C1 24.2843 7.71573 31 16 31Z" strokeWidth="2"/>
                    <path d="M9 9L24 24"  strokeWidth="2" strokeLinecap="square"/>
                    <path d="M8.49512 23.4586L24.5049 9.54144"  strokeWidth="2" strokeLinecap="square"/>
                </svg>
            </button>
			<div className="content">
                {children}
            </div>
        </div>,
        _modal    
    ) 
    :
    <div className="modal-window_absence">
        Node for Modal Windows was not found
    </div>

})


export default Modal;

/*
import './modal.scss'
import { createPortal } from 'react-dom';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';

interface IProps {
    escExit: boolean
    onClose?: () => void
}

export interface IModalFunctions {
    openModal: (owner?: string) => void;
    setChildren: (children: React.ReactNode) => void;
    closeModal: () => void;
    getOwner: () => string;
}


const Modal = forwardRef<IModalFunctions, IProps>(({escExit, onClose}, ref) => {
    useImperativeHandle(ref, () => ({
        openModal(owner?) {
            open(owner || '')
        },
        setChildren(children) {
            setChildren(children)
        },
        closeModal() {
            close()
        },
        getOwner() {
            return owner
        },
    }));
    
    const [children, setChildren] = useState<React.ReactNode>(<></>)
    const _modal = document.getElementById('modal') as HTMLElement;
    const [visible, setVisible] = useState<boolean>(false)
    const [owner, setOwner] = useState<string>('')

    const modalKeyListener = (e: KeyboardEvent) => {
        if (onClose) {
            if (escExit && e.keyCode === 27){
                setChildren(null);
                onClose() 
            }
        } else {
            escExit && e.keyCode === 27 && close();
        }
    }
  

    useEffect(() => {
        document.addEventListener("keyup", modalKeyListener);
        return () => {document.removeEventListener("keyup", modalKeyListener)}
    }, [])



    const close = () => {
        setChildren(null)
        setVisible(false)
    }

    
    const open = (owner: string) => {
        setVisible(true)
        setOwner(owner)
    }

    

    return _modal ? createPortal(
        <div className={visible ? "modal-window visible" : "modal-window"}>
            <button className="closer" aria-label='close | закрыть' onClick={onClose ? onClose : close}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" stroke="#979797" clipRule="evenodd" d="M16 31C24.2843 31 31 24.2843 31 16C31 7.71573 24.2843 1 16 1C7.71573 1 1 7.71573 1 16C1 24.2843 7.71573 31 16 31Z" strokeWidth="2"/>
                    <path d="M9 9L24 24"  strokeWidth="2" strokeLinecap="square"/>
                    <path d="M8.49512 23.4586L24.5049 9.54144"  strokeWidth="2" strokeLinecap="square"/>
                </svg>
            </button>
			<div className="content">
                {children}
            </div>
        </div>,
        _modal    
    ) 
    :
    <div className="modal-window_absence">
        Node for Modal Windows was not found
    </div>

})


export default Modal;*/