import { useState, useEffect, useMemo } from 'react'
import './auth.scss'
import { AnyAction, bindActionCreators } from "redux";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { IFullState, ILoggingForm, IUserState, TLang } from '../../interfaces';
import { inputsProps, resetFetch } from '../../assets/js/consts';
import { deepCopy, focusMover, prevent } from '../../assets/js/processors';
import Hider from '../InputHider/InputHider';
import { inputChecker } from '../../assets/js/processors';

import { allActions } from "../../redux/actions/all";
import { IModalFunctions } from '../Modal/ModalNew';

interface IPropsState {
    lang: TLang
    userState: IUserState
    modal: IModalFunctions | null
}

interface IPropsActions {
    setState: {
        user: typeof allActions.user
    }
}

interface IProps extends IPropsState, IPropsActions {
    onCancel: () => void
}


const Auth: React.FC<IProps> = ({lang, userState, setState, modal, onCancel}): JSX.Element => {

    const [register, setRegister] = useState<boolean>(false) //true - register, false - login
    const [hideInput, setHideInput] = useState<boolean>(true) //true - hide passwords, false - show
    const [form, setForm] = useState<ILoggingForm>({name: userState.name, email: userState.email, phone: userState.phone, password: '', repassword: ''})
    const processedContainer = '[data-selector="auth-form"]'
    
    const focuser = useMemo(() => focusMover(), [lang])
    

    const onChangeText: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const key = e.target.name as keyof ILoggingForm
        setForm({...form, [key]: e.target.value});
        (e.target as HTMLElement).parentElement?.classList.remove('incorrect-value');
        (userState.auth.status === 'error') && setState.user.setAuth(deepCopy(resetFetch))
    }

    const switchType = (register: boolean) => {
        setRegister(register),
        (userState.auth.status === 'error') && setState.user.setAuth(deepCopy(resetFetch))
    }


    const onCancelClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        prevent(e)
        onCancel()
    }
    

    const onSubmit: React.EventHandler<any> = (e) => {
        prevent(e)
        //check errors
        focuser.focusAll(); //run over all elements to get all errors
        const errorFields = document.querySelector(processedContainer)?.querySelectorAll('.incorrect-value') || []
        if (errorFields?.length > 0) return
        register ? setState.user.register(form) : setState.user.login(form)
    }



    useEffect(() => { 
        userState.auth.status === 'success' && onCancel()  //exit after successfull authorization
    }, [userState.auth.status])



    useEffect(() => {
        focuser.create({container: processedContainer})
        modal?.contentChanged()
    }, [register, lang])


    const errorsList = useMemo(() => userState.auth.errors?.map((error, i) => <li key={i} className='errors__item'>{error[lang]}</li>)
    , [userState.auth.errors])


   
    return (
        <div className="login">
            <div className="form__container">
                <div className="sign-selector__container">
                    <button className={`button_select ${register ? '' : 'selected'}`} onClick={() => switchType(false)} data-testid='authBtnToLogin'>Login</button>
                    <button className={`button_select ${register ? 'selected' : ''}`} onClick={() => switchType(true)} data-testid='authBtnToRegister'>Register</button>
                </div>
                <form className='login__form' data-selector="auth-form">
                    {register &&
                    <div className="block_input" data-selector="input-block">
                        <label htmlFor="name">{lang === 'en' ? 'Your name' : 'Ваше имя'}</label>
                        <input 
                            data-selector="input"
                            name="name"
                            type="text" 
                            onChange={onChangeText}
                            value={form.name}
                            onBlur={(e) => inputChecker({lang, min: inputsProps.name.min, max:inputsProps.name.max, el: e.target})}/>
                    </div>}
                    <div className="block_input" data-selector="input-block">
                        <label htmlFor="user_email">{lang === 'en' ? 'Your email' : 'Ваша почта'}</label>
                        <input 
                            data-selector="input"
                            className="input-element" 
                            name="email"
                            type="email" 
                            value={form.email}
                            onChange={onChangeText} 
                            autoFocus
                            onBlur={(e) => inputChecker({lang, min:inputsProps.email.min, max:inputsProps.email.max, type: 'email', el: e.target})}/>
                    </div>
                    {register &&
                        <div className="block_input" data-selector="input-block">
                            <label htmlFor="user_phone">{lang === 'en' ? 'Your phone' : 'Ваш телефон'}</label>
                            <input 
                                data-selector="input"
                                className="input-element" 
                                name="phone"
                                type="tel" 
                                value={form.phone}
                                onChange={onChangeText} 
                                onBlur={(e) => inputChecker({lang, min:inputsProps.phone.min, max:inputsProps.phone.max, type: 'phone', el: e.target})}/>
                        </div>
                    }
                    <div className="block_input" data-selector="input-block">
                        <label htmlFor="user_password">{lang === 'en' ? 'Your password' : 'Ваш пароль'}</label>
                        <input 
                            data-selector="input"
                            className="input-element" 
                            name="password"
                            type={hideInput ? `password` : 'text'}
                            value={form.password}
                            onChange={onChangeText} 
                            onBlur={(e) => inputChecker({lang, min:inputsProps.password.min, max:inputsProps.password.max, el: e.target})}/>
                        <Hider hidden={hideInput} onClick={() => setHideInput(prev => !prev)}/>
                    </div>
                    {register &&
                        <div className="block_input" data-selector="input-block">
                            <label htmlFor="user_repassword">{lang === 'en' ? 'Repeat your password' : 'Повторите ваш пароль'}</label>
                            <input 
                                data-selector="input"
                                className="input-element" 
                                name="repassword"
                                type={hideInput ? `password` : 'text'}
                                value={form.repassword}
                                onChange={onChangeText}
                                onBlur={(e) => inputChecker({lang, min:inputsProps.password.min, max:inputsProps.password.max, el: e.target, exact: form.password})}/>
                        </div>
                    }
                    {userState.auth.status === 'error' &&
                        <div className="errors__container" data-testid='authErrorsContainer'>
                            <span className='errors__header'>{lang === 'en' ? 'Errors' : 'Ошибки'}: </span>
                            <ul className='errors__list'>
                                {userState.auth.errors && userState.auth.errors.length > 0 && errorsList}
                            </ul>
                        </div>
                    }
                    <div className="control__container">
                        <button className='button_blue color_reverse' type="submit" onClick={onSubmit} disabled={userState.auth.status === 'fetching'} data-testid='authBtnLogin'>
                            {register ? 
                                lang === 'en' ? 'Register' : 'Регистрация' 
                                :  
                                lang === 'en' ? 'Login' : 'Вход'
                            }
                        </button>
                        <button className='button_blue color_reverse' onClick={onCancelClick} data-testid='authBtnCancel'>{lang === 'en' ? 'Cancel' : 'Отмена'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}


const mapStateToProps = (state: IFullState): IPropsState => ({
    lang: state.base.lang,
    userState: state.user,
    modal: state.base.modal.current
})

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>): IPropsActions => ({
    setState: {
		user: bindActionCreators(allActions.user, dispatch),
	}
})
  
    
    
export default connect(mapStateToProps, mapDispatchToProps)(Auth)