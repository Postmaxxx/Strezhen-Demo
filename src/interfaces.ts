import { AnyAction } from "redux";
import { IModalFunctions } from "./components/Modal/ModalNew";

//================================================================================
export type TTheme = 'dark' | 'light'
export type TLang = 'en' | 'ru'
export type TId = string //id of any element

export interface ILink {
    name: TLangText,
    url: string
}


export interface IImageSizePath {
    subFolder: string
    w: number,
    h: number
}
export interface IImages {
    files: string[]
    basePath: string
    sizes: IImageSizePath[]
}

//---------------------------------------redux
export interface IAction<T> {
    type: string;
    payload?: T; 
}

export interface IActionCreator<T> {
    (payload?: T): IAction<T>
}

export interface IDispatch {
    <T extends AnyAction>(action: T): T
}


//---------------------------------------------data fetch
export type TFetchStatus = 'idle' | 'success' | 'fetching' | 'error'

export interface IFetch {
    status: TFetchStatus
    message: TLangText //for handling messages from BE
    errors?: TLangText[] ////for handling errors-list from BE
    controller?: AbortController //controller of current fetch 
}
export interface IMessageModal {
    header: string
    status: string
    text: string[]
}





//---------------------------------------------lang text
export type TLangText = {
    [key in TLang]: string
}



//-------------------------------------------splider
export interface ISpliderOptions {
	type?   : string
	perPage?: number
	gap?: string | number
	lazyLoad?: boolean
	updateOnMove?: boolean
	perMove?: number
	pagination?: boolean
	arrows?: boolean
	drag?: boolean
	speed?: number
	autoplay?: boolean
    wheel?: boolean
    wheelSleep?: number
	interval?: number
	pauseOnHover?: boolean
    fixedWidth?: string
    focus?: number | "center"
    rewind?: boolean
	isNavigation?: boolean
    direction?: "ltr" | "rtl" | "ttb" | undefined
    height?: string
    releaseWheel?: boolean
	breakpoints?: {
		[key: number]: Partial<ISpliderOptions>
	}
}




//----------------------------------- color
export interface IColor {
    _id: TId
    name: TLangText
    urls: {
        full: string
        thumb: string
    }
    active?: boolean
}

//----------------------------------- pros / cons
export interface IProsCons {
    pros: TLangText[]
    cons: TLangText[]
}



//----------------------------------- features
export interface IFeature {
    name: TLangText
    value: TLangText
}



//==========================================Fibers State
export interface ISendFiber extends Omit<IFiber, 'images'> { //for sending to BE
    files: File[]
}


export interface IFiberParam {
    [key: string]: number | string //for enumerating and useinmg with inputs
    strength: number //MPa
    stiffnes: number //1..10
    durability: number //1..10
    resistantImpact: number //1..10
    minTemp: number //in C
    maxTemp: number //in C
    thermalExpansion: number //µm/m-°C
    density: number //g/cm3
    flexible: number //0..2, 0 -no, 1 - maybe, 3 - ok
    elastic: number //0..2, 0 -no, 1 - maybe, 3 - ok
    soft: number //0..2, 0 -no, 1 - maybe, 3 - ok
    composite: number //0..2, 0 -no, 1 - maybe, 3 - ok
    resistantUV: number //0..2, 0 -no, 1 - maybe, 3 - ok
    resistantWater: number //0..2, 0 -no, 1 - maybe, 3 - ok
    resistantHeat: number //0..2, 0 -no, 1 - maybe, 3 - ok
    resistantChemically: number //0..2, 0 -no, 1 - maybe, 3 - ok
    dissolvable: number //0..2, 0 -no, 1 - maybe, 3 - ok
    resistantFatigue: number //0..2, 0 -no, 1 - maybe, 3 - ok
    cutting: number //0..2, 0 -no, 1 - maybe, 3 - ok
    grinding: number  //0..2, 0 -no, 1 - maybe, 3 - ok
    price: number //1-low...5-high
    priceGr: string //price for 1gr
}


export interface IFiber {
    _id: TId
    name: TLangText
    text: TLangText
    short: {
        name: TLangText
        text: TLangText
    }
    images: IImages
    params: IFiberParam
    proscons: IProsCons
    colors: TId[] //list of colors ids
    active?: boolean
}

export interface IFibersState {
    selected: TId //id
    showList: TId[] //list of id to show
    load: IFetch //receiving data 
    send: IFetch //sending data
    fibersList: IFiber[]
}





//============================================== category state
export interface ISendProduct extends Omit<IProduct, 'images'> { //for sending to BE
    files: File[]
}

export interface IMod {
    name: TLangText
    weight: number
}

export interface IProduct {
    _id: TId
    //price: number
    name: TLangText
    text: TLangText
    text_short: TLangText
    images: IImages
    fibers: TId[] //array of fiber ids
    mods: IMod[]
    category: TId
    active?: boolean
}


export interface IProductShort { //for gallery
    _id: TId
    //price: TLangText
    name: TLangText
    text_short: TLangText
    images: IImages,
    active?: boolean
}


export interface ICategory {
    _id: TId
    products: IProductShort[] // loaded products,
    loadCategory: IFetch //for load products in selected category
    product: IProduct //current opened product (in case opened from bookmarks)
    loadProduct: IFetch
    sendProduct: IFetch
}


export interface ICatalogItem { //one category name
    name: TLangText
    total: number //total amount of products in category
    _id: TId
    active: number //amount of active products in category
}

export interface ICatalog{
    load: IFetch //for load categoriesList
    send: IFetch //for load categoriesList
    list: ICatalogItem[] //list of all categories
}

export interface ICatalogState {
    catalog: ICatalog //list of all categories
    category: ICategory //current category
}





//============================================== news state
export interface ISendNewsItem extends Omit<INewsItem, 'images'> { //for sending to BE
    files: File[]
}


export interface INewsItem { //for detail view on news detail page
    _id: TId
    header: TLangText
    date: Date
    short: TLangText
    text: TLangText
    images: IImages
}

export interface INewsItemShort { // for preview news on main page
    _id: TId
    header: TLangText
    date: Date
    short: TLangText
    images: IImages
}

export interface INewsState {
    load: IFetch
    loadOne: IFetch
    newsOne: INewsItem
    send: IFetch
    total: number
    newsList: INewsItemShort[]
}



//============================================== base state
export interface IBaseState {
    theme: TTheme
    lang: TLang
    mobOpened: boolean //mobile nav panel opened
    desktopOpened: boolean //desktop nav panel opened
    modal: React.RefObject<IModalFunctions>
}




//============================================== Colors state
export interface ISendColor {
    _id: string
    name: {
        ru: string, 
        en: string
    }, 
    files: { //specific due to the neccessarity to have different images for thumb and full images
        full: File, 
        thumb: File
    },
    active: boolean
}



export interface IColorsState {
    load: IFetch
    send: IFetch
    colors: IColor[] //list of all colors
}





//============================================== Cart state
export interface ICartItem {
    product: IProduct
    fiber: TId 
    color: TId 
    type: TLangText
    amount: number
}


export interface ICartState {
    load: IFetch
    send: IFetch
    items: ICartItem[]
    fixed: TLangText[] //errors list of cart errors from server
}



//============================================== User state
export interface IUserState {
    name: string
    email: string
    phone: string
    token: string
    message: string
    auth: IFetch //for authenticating
    isAdmin: boolean
    cart: ICartState
    sendOrder: IFetch //for sending order
}







//---------------------------------ALL ORDERS----------------------------------------------------------
export type OrderType = 'finished' | 'new' | 'working' | 'canceled'

export interface IFilterUser extends Pick<IUserState, "name" | "phone" | "email"> { //User for filter orders for Admin in All_Orders
    _id: TId
}

export interface IOrdersCartItem { //cart in order, for All_Orders
    productId: string
    productName: TLangText
    fiberName: TLangText
    colorName: TLangText
    amount: number
    type: TLangText
}


export interface IOrdersItem {
    _id: TId
    date: string
    message: string
    status: OrderType
    cart: IOrdersCartItem[]
    pathToFiles: string
    attachedFiles: string[]
}


export interface IUserOrders { //user with userInfo and orders for requested period and with requested stauts
    userInfo: IFilterUser 
    orders: IOrdersItem[]
}

interface IUserList {
    load: IFetch
    list: IFilterUser[] //userlist to pick user, for Admin in All_Orders
}

export interface IOrdersState {
    users: IUserOrders[] //list of all requested users with orders for requested period and with requested status 
    userList: IUserList //list of all users, for fast fetch just only userInfo
    load: IFetch
    send: IFetch
}


//============================================== full state
export interface IFullState {
    base: IBaseState
    news: INewsState
    fibers: IFibersState
    catalog: ICatalogState
    colors:  IColorsState
    user: IUserState
    content:  IContentState
    orders: IOrdersState
}





//////////////////////////////////for intercommunicate with BackEnd
export interface IUserLoginResOk {
    message: TLangText
    user: Pick<IUserState, 'name' | 'email' | 'phone' | 'token' | 'isAdmin'> & {cart: ICartItem[]} & {fixed: ICartState["fixed"]}
}


export interface IErrRes { //type for response with not 2XX status
    errors?: TLangText[]
    message: TLangText
}



export interface IMsgRes {  //type for response with message
    message: TLangText
}


export interface ILoggingForm { //for form login/register form
    email: string
    password: string
    name: string,
    phone: string
    repassword: string
}

export interface ICarouselMax { //for CarouselMax
    images: IImages
}

export interface IContentState { //for other app content 
    carousel: ICarouselMax
    send: IFetch
    load: IFetch
}


//export type TImageSizes = 'thumb' | 'small' | 'medium' | 'full' | 'spliderMain' | 'preview' //all supported types of images.


export type TTypeRequest = 'create' | 'update' 


/*
export interface IModalOpen {
    owner: string,
    children: JSX.Element
}

export interface IModal {
    escExit: boolean
    ref: React.RefObject<IModalFunctions>
    close: () => void
    open: (owner: string) => void
    children: JSX.Element
}*/

export interface ISizesItem {
    h: number
    w: number
}
export interface IImageSizes {
    thumb: ISizesItem
    preview: ISizesItem
    small: ISizesItem
    medium: ISizesItem
    big: ISizesItem
    full: ISizesItem
    carouselMaxFull: ISizesItem
    carouselMaxMedium: ISizesItem
    carouselMaxSmall: ISizesItem
}


