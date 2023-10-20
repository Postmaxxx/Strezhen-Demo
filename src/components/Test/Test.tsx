import { useState, useRef, useMemo, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { IFiber, IFullState, TId, TLang } from "../../interfaces";
import "./nav.scss"
import navLogo from "../../assets/img/nav_logo.webp"
import { connect } from "react-redux";
import { AnyAction, bindActionCreators } from "redux";
import { Dispatch } from "redux";
import CartInformer from "../../components/CartInformer/CartInformerUpdater";
import Auth from "../../components/Auth/Auth";
import { allActions } from "../../redux/actions/all";
import initialUserState from "../../../src/redux/initialStates/user";
import { navList } from "../../../src/assets/js/consts";
import { IModalFunctions } from "../../../src/components/Modal/ModalNew";
import useScreenMeter from "../../../src/hooks/screenMeter";
import LangSwitcher from "../../../src/components/LangSwitcher/LangSwitcher";
import ThemeSwitcher from "../../../src/components/ThemeSwitcher/ThemeSwitcher";
import React from 'react'


interface IPropsState {
    modal: IModalFunctions | null
}




interface IProps extends IPropsState {}


const Nav:React.FC<IProps> = ({modal}): JSX.Element => {



    const closeModal = () => {
        modal?.closeCurrent()
	}


    const onClickNotLink = () => {
        modal?.openModal({
			name: 'test',
            onClose: closeModal,
			children: <Auth onCancel={closeModal}/>
		})
    }


    const desktopNav = useMemo(() => {
        return <div data-testid='test'>
            <a onClick={onClickNotLink} data-testid='testbtn'></a>
    </div>}, [modal])




    return (
        <>
            {desktopNav}
        </>
    )
}


const mapStateToProps = (state: IFullState): IPropsState => ({
    modal: state.base.modal.current
})
  


export default connect(mapStateToProps, )(Nav)
