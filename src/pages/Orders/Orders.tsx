import './orders.scss'
import { allActions } from "../../redux/actions/all";
import { AnyAction, bindActionCreators } from "redux";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { IFetch, IFullState, IOrdersItem, IOrdersState, OrderType, TLang } from '../../interfaces';
import {Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { gapForOrders, orderStatuses, timeOffset, usersPerPage } from '../../assets/js/consts';
import dayjs from "dayjs";
import Preloader from '../../components/Preloaders/Preloader';
import { prevent } from '../../assets/js/processors';
import { NavLink } from 'react-router-dom';



interface IPropsState {
    lang: TLang,
    colorsLoad: IFetch
    fibersLoad: IFetch
    isAdmin: boolean
    ordersState: IOrdersState
}

interface IPropsActions {
    setState: {
        user: typeof allActions.user
        fibers: typeof allActions.fibers
        colors: typeof allActions.colors
        catalog: typeof allActions.catalog
        orders: typeof allActions.orders
    }
}

interface IProps extends IPropsState, IPropsActions {}


const Orders: React.FC<IProps> = ({lang, colorsLoad, fibersLoad, ordersState, isAdmin, setState}): JSX.Element => {
    const _dateFrom = useRef<HTMLInputElement>(null)
    const _dateTo = useRef<HTMLInputElement>(null)
    const _user = useRef<HTMLSelectElement>(null)
    const _status = useRef<HTMLSelectElement>(null)
    const [page, setPage] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<string[]>([])

    const [loaded, setLoaded] = useState<boolean>(false)


    useEffect(() => {
        setTotalPages(new Array(Math.ceil(ordersState.users.length / usersPerPage) || 1).fill('')?.map((item, i) => String(i+1)))
        setPage(0)
    }, [ordersState.users])


    useEffect(() => { //initial load data
        if (colorsLoad.status !== 'success' && colorsLoad.status  !== 'fetching') {
			setState.colors.loadColors()
		}
        if (ordersState.userList.load.status !== 'success' && ordersState.userList.load.status  !== 'fetching') {
			setState.orders.loadUsers()
		}

        if (colorsLoad.status === 'success' && fibersLoad.status === 'success') {
            setLoaded(true)
            if (!_dateFrom.current || !_dateTo.current) return           
            _dateFrom.current.value = dayjs().subtract(gapForOrders, 'months').format('YYYY-MM-DD')
            _dateTo.current.value = dayjs().format('YYYY-MM-DD')
        }
    }, [colorsLoad.status, fibersLoad.status, ordersState.userList.load.status, loaded])


    const loadOrders = (e: React.MouseEvent<HTMLButtonElement>): void => {
        prevent(e);
        if (!_dateFrom.current || !_dateTo.current || !_status.current || !_user.current) return
        if (!_dateFrom.current.value) {
            return alert('Wrong date from')
        }
        if (!_dateTo.current.value) {
            return alert('Wrong date to')
        }    

        const dateFrom: string = new Date(_dateFrom.current.value).toISOString()
        const dateTo: string = dayjs(_dateTo.current.value).add(1, 'day').format("YYYY-MM-DDT00:00:00.000") + "Z";
        
        const dateTimeFrom = dayjs(dateFrom).add(timeOffset, 'hours').toISOString();
        const dateTimeTo = dayjs(dateTo).add(timeOffset, 'hours').toISOString();
        setState.orders.loadOrders({userId: _user.current.value, status: _status.current.value, from: dateTimeFrom, to: dateTimeTo})
    }


    interface IOnStatusChange {
        e: React.ChangeEvent<HTMLSelectElement> 
        orderId: string
    }

    const onStatusChange = ({e, orderId}: IOnStatusChange): void => {
        setState.orders.changeOrderStatus(orderId, e.target.value as OrderType)
    }



    const orderCart = (order: IOrdersItem) => {
        return order.cart.map((cartItem, i) => (
            <Fragment key={i}>
                <div className="cell first">
                    <NavLink to={`../catalog/${cartItem.productId}`} >
                        {cartItem.productName[lang]}
                    </NavLink>
                </div>
                <div className="cell">{cartItem.fiberName[lang]}</div>
                <div className="cell">{cartItem.colorName[lang]}</div>
                <div className="cell">{cartItem.type[lang]}</div>
                <div className="cell center">{cartItem.amount}</div>
            </Fragment>
        ))
    }


    const filesList = (order: IOrdersItem) => {
        return (
            order.attachedFiles.map(file => (
                <div className="cell" key={file}>
                    <a download href={`${order.pathToFiles}/${file}`}>{file}</a>
                </div>)
            )
        )
    }


    const statuses = useMemo(() => {
        return orderStatuses.map(status => <option key={status.name[lang]} value={status.value}>{status.name[lang]}</option>)
    }, [lang])


    const usersTable = ordersState.users
        .filter((user, i) => (i >= page*usersPerPage && i < (page+1)*usersPerPage))
        ?.map((user, i: number) => {
            return (
                <div className="block_user" key={user.userInfo._id}>
                        <div className="block_text user__info">
                            <h2 className='user__header'>{user.userInfo.name}</h2>
                            <span className='user__subheader'>
                                <a href={`mailto: ${user.userInfo.email}`} type="email">{user.userInfo.email}</a> / 
                                <a href={`tel: ${user.userInfo.phone}`} type="email"> {user.userInfo.phone}</a>
                            </span>
                        </div>
                    <div className="orders__list">
                        {user.orders.map((order) => {
                            return (
                                <div className='order' key={order._id}>
                                    <div className='block_inputs_mixed order__date-status'>
                                        <span className='order__date'>{lang === 'en' ? 'Date' : 'Дата'}: {dayjs(order.date).add(-timeOffset, 'hours').format('YYYY-MM-DD')}</span>
                                        {isAdmin ? 
                                            <div className="block_input">
                                                <label htmlFor={`order-${order._id}`}>{lang === 'en' ? 'Status' : 'Статус'}: </label>
                                                <select 
                                                    id={`order-${order._id}`}
                                                    name="statusSelector" 
                                                    defaultValue={order.status} 
                                                    onChange={(e) => {onStatusChange({e, orderId: order._id})}}
                                                >
                                                    {statuses}
                                                </select>
                                            </div>
                                            : 
                                            <div className="block_input block_input_right">
                                                <span>{lang === 'en' ? 'Status' : 'Статус'}: <strong>{orderStatuses.find(status => status.value === order.status)?.name[lang]}</strong></span>
                                            </div>}

                                    </div>
        
                                    {order.cart.length > 0 &&
                                        <div className="order__cart">
                                            <div className="cell head first">{lang === 'en' ? 'Product' : 'Товар'}</div>
                                            <div className="cell head">{lang === 'en' ? 'Fiber' : 'Материал'}</div>
                                            <div className="cell head">{lang === 'en' ? 'Color' : 'Цвет'}</div>
                                            <div className="cell head">{lang === 'en' ? 'Type' : 'Тип'}</div>
                                            <div className="cell head">{lang === 'en' ? 'Amt' : 'Кол'}</div>
                                            {orderCart(order)}
                                        </div>
                                    }

                                    {order.message.length > 0 &&
                                        <p className="order__message"><strong>{lang === 'en' ? "Message" : "Сообщение"}:</strong> {order.message}</p>
                                    }
                                    {order.attachedFiles.length > 0 &&
                                        <div className='files'>
                                            <h4 className='files__header'>{lang === 'en' ? "Attached files" : "Прикрепленные файлы"}</h4>
                                            <div className="files__list">
                                                {filesList(order)}
                                            </div>
                                        </div>
                                    }
        
                                </div>
                            )
                        })}
                    </div>
                </div>
            )
        })



    const userFilter = useMemo(() => {
        return (
            <>
                <label htmlFor="user">{lang === 'en' ? 'Select user' : 'Выберите пользователя'}</label>
                <select name="user" id="user" ref={_user}>
                    {isAdmin  && <option value="all" defaultValue='all'>{lang === 'en' ? 'All' : 'Все'}</option>}
                    {ordersState.userList.list?.map(item => (
                        <option key={item._id} value={item._id}>{item.name} - {item.email}</option>
                    ))}
                </select>
            </>
        )
    }, [ordersState.userList.list, lang])


    const statusesFilter = useMemo(() => {
        return (
            <>
                <label htmlFor="status">{lang === 'en' ? 'Select status' : 'Выберите статус'}</label>
                <select name="status" id="status" ref={_status}>
                    <option value="all" defaultValue='all'>{lang === 'en' ? 'All' : 'Все'}</option>
                    {statuses}
                </select>
            </>
        )
    }, [lang])


    const dateFromFilter = <>
            <label htmlFor="date-from">{lang === 'en' ? 'Date from' : 'С даты'}</label>
            <input type="date" id='date-from' ref={_dateFrom}/>
        </>


    const dateToFilter = <>
                <label htmlFor="date-to">{lang === 'en' ? 'Date to' : 'По дату'}</label>
                <input type="date" id='date-to' ref={_dateTo}/>
            </>



    const pagination = useMemo(() => {
        return (
            totalPages.length > 1 &&
                <ul className="pagination">
                    {totalPages.map((item, i) => {
                        return (
                            <li key={item}>
                                <button
                                    className={`pagination__page-number ${i === page ? 'selected' : ''}`} 
                                    onClick={(e) => setPage(i)}>
                                        {item}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            
        )
    }, [page, totalPages])
    


    

    return (
        <div className="page_orders">
            <div className='container_page'>
                <div className="container">
                    <div className="block_text">
                        <h1>{lang === 'en' ? `All orders` : `Все заказы`}</h1>
                    </div>
                    {loaded && <>
                        <form className='form_full form_filters'>
                            <div className="block_text">
                                <h3>{lang === 'en' ? 'Select the search parameters' : 'Введите критерии поиска'}</h3>           
                            </div>
                            <div className={`block_inputs_${isAdmin ? '4' : '3'}`}>
                                <div className={`block_input ${isAdmin ? "" : "no-display"}`}>
                                    {userFilter}
                                </div>
                                <div className="block_input">
                                    {statusesFilter}
                                </div>
                                <div className="block_input">
                                    {dateFromFilter}
                                </div>
                                <div className="block_input">
                                    {dateToFilter}
                                </div>

                            </div>
                            <button className='button_blue' onClick={loadOrders}>{lang === 'en' ? 'Load orders' : 'Загрузить заказы'}</button>
                        </form>
                        
                        {ordersState.users.length > 0 && ordersState.load.status ==='success' ? 
                            <div className="orders form_full">
                                {usersTable}
                            </div>
                        : 
                            ordersState.load.status === 'success' && 
                                <div className="orders form_full">
                                    <span className="informer_empty">{lang === 'en' ? 'Nothing has been found' : 'Ничего не найдено'}</span>
                                </div>
                            
                        }
                        {ordersState.load.status === 'fetching' && <Preloader />}
                        {pagination}
                    </>}
                    
                </div>
            </div>
        </div>
    )
}



const mapStateToProps = (state: IFullState): IPropsState => ({
    lang: state.base.lang,
    isAdmin: state.user.isAdmin,
    colorsLoad: state.colors.load,
    fibersLoad: state.fibers.load,
    ordersState: state.orders
})


const mapDispatchToProps = (dispatch: Dispatch<AnyAction>):IPropsActions => ({
    setState: {
		fibers: bindActionCreators(allActions.fibers, dispatch),
		colors: bindActionCreators(allActions.colors, dispatch),
		catalog: bindActionCreators(allActions.catalog, dispatch),
		user: bindActionCreators(allActions.user, dispatch),
		orders: bindActionCreators(allActions.orders, dispatch),
	}
})
  
  
    
export default connect(mapStateToProps, mapDispatchToProps)(Orders)
