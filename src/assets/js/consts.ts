import { IFetch, IFiberParam, IImageSizes, IMessageModal, INewsItem, ISendColor, ISendFiber, ISendProduct, TLangText } from "../../interfaces"


const timeModalClosing: number = 500 //transition of closing modal window

const intervalBetweenRequests: number = 3000 //time between requests in case of error

const strengthMin:number = 25 //fiber strength min
const strengthMax:number = 80 //fiber strength max

const gapForOrders: number = 1 //months

const usersPerPage:number = 2 //for Admin for AllOrders page

const loadNewsPerRequest: number = 4 //how many news will be loaded per click "more news"

const tipsTransition:number = 3000 //in ms, how long tip will be shown before disappearing

const debounceTime: number = 2000;

const socials: Record<string, string> = { //link to groups
    vk: "https://vk.ru",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    telegram: "https://telegram.org",
}

const maxAmountToOrder: number = 990 //max amount for amountChanger

const defaultSelectItem = {
    name: {
        en: 'Select', 
        ru: 'Выберите'
    },
    value: ''
}

const createNewItemId = 'createNew'

const statuses = {
    active: {
        name: {
            en: 'Active',
            ru: 'Активно'
        },
        value: 'active'
    },
    suspended: {
        name: {
            en: 'Suspended',
            ru: 'Приостановлено'
        },
        value: 'suspended'
    }
}


const imageExtentions: string[] = ['jpg', 'jpeg', 'bmp', 'svg', 'png', 'tiff', 'webp'] //files with these extentions will be treaten as images, preview will be loaded

const APIList = { //all routes to BE
    catalog: {
        get: { //load all catalog
            url: `${process.env.REACT_BACK_URL}/api/catalog/list`,
            method: "GET",
            timeout: 10000
        },
        update: { //send updated catalog
            url: `${process.env.REACT_BACK_URL}/api/catalog/list`,
            method: "PUT",
            timeout: 10000
        },
    },
    category: {
        getSome: { //get some products from one category (short format), ?_id=${CategoryId}&from=${NumberFrom}&to=${NumberTo}
            url: `${process.env.REACT_BACK_URL}/api/catalog/category`,
            method: "GET",
            timeout: 20000
        }
    },
    product: {
        create: { //create product
            url: `${process.env.REACT_BACK_URL}/api/catalog/product`,
            method: "POST",
            timeout: 60000
        },
        update: { //update existed product
            url: `${process.env.REACT_BACK_URL}/api/catalog/product`,
            method: "PUT",
            timeout: 60000
        },
        get: { //get one product
            url: `${process.env.REACT_BACK_URL}/api/catalog/product`,
            method: "GET",
            timeout: 15000
        },
        delete: { //delete one product
            url: `${process.env.REACT_BACK_URL}/api/catalog/product`,
            method: "DELETE",
            timeout: 10000
        },
    },
    news: {
        getSome: { //get some news, +?from=${FromIdex}&amount=${AmountOfNews}
            url: `${process.env.REACT_BACK_URL}/api/news/get-some`,
            method: "GET",
            timeout: 15000
        },
        getOne: { //get some news, +?from=${FromIdex}&amount=${AmountOfNews}
            url: `${process.env.REACT_BACK_URL}/api/news/get-one`,
            method: "GET",
            timeout: 15000
        },
        create: { //create newsItem
            url: `${process.env.REACT_BACK_URL}/api/news/create`,
            method: "POST",
            timeout: 60000
        },
        update: { //update newsItem
            url: `${process.env.REACT_BACK_URL}/api/news/edit`,
            method: "PUT",
            timeout: 60000
        },
        delete: { //update newsItem
            url: `${process.env.REACT_BACK_URL}/api/news/delete`,
            method: "DELETE",
            timeout: 10000
        },
    },
    colors: {
        get: { //load all colors
            url: `${process.env.REACT_BACK_URL}/api/colors/load-all`,
            method: "GET",
            timeout: 20000
        },
        create: { //create newsItem
            url: `${process.env.REACT_BACK_URL}/api/colors/create`,
            method: "POST",
            timeout: 30000
        },
        update: { //update newsItem
            url: `${process.env.REACT_BACK_URL}/api/colors/edit`,
            method: "PUT",
            timeout: 30000
        },
        delete: { //delete newsItem
            url: `${process.env.REACT_BACK_URL}/api/colors/delete`,
            method: "DELETE",
            timeout: 10000
        }
    },
    content: {
        carouselMax: {
            update: { //update carousel
                url: `${process.env.REACT_BACK_URL}/api/content/carousel`,
                method: 'PUT',
                timeout: 60000
            },
            get: { //load carousel
                url: `${process.env.REACT_BACK_URL}/api/content/carousel`,
                method: 'GET',
                timeout: 20000
            }
        }
    },
    fibers: {
        get: { //load all fibers
            url: `${process.env.REACT_BACK_URL}/api/fibers/all`,
            method: 'GET',
            timeout: 20000
        },
        create: { //create fiber
            url: `${process.env.REACT_BACK_URL}/api/fibers/create`,
            method: 'POST',
            timeout: 60000
        },
        update: { //update fiber
            url: `${process.env.REACT_BACK_URL}/api/fibers/edit`,
            method: 'PUT',
            timeout: 60000
        },
        delete: { //delete fiber
            url: `${process.env.REACT_BACK_URL}/api/fibers/delete`,
            method: 'DELETE',
            timeout: 10000
        },
    },
    orders: {
        getSome: { //load orders, ?from=${FromDate}&to=${ToDate}&userId=${UserId}&status=${orderStatuses}`
            url: `${process.env.REACT_BACK_URL}/api/user/orders`,
            method: 'GET',
            timeout: 60000
        },
        editStatus: { // edit order status
            url: `${process.env.REACT_BACK_URL}/api/user/orders`,
            method: 'PATCH',
            timeout: 10000
        },
        getUsers: { //load all customers
            url: `${process.env.REACT_BACK_URL}/api/user/users`,
            method: 'GET',
            timeout: 20000
        }
    },
    user: {
        register: { //register new user
            url: `${process.env.REACT_BACK_URL}/api/user/register`,
            method: 'POST',
            timeout: 10000
        }, 
        login: { //login user using email + password
            url: `${process.env.REACT_BACK_URL}/api/user/login`,
            method: 'POST',
            timeout: 10000
        },
        loginToken: {//login user using token
            url: `${process.env.REACT_BACK_URL}/api/user/login-token`,
            method: 'POST',
            timeout: 10000
        },
        createOrder: { //create new order
            url: `${process.env.REACT_BACK_URL}/api/user/order`,
            method: 'POST',
            timeout: 60000
        },
        createMessage: {// create new message
            url: `${process.env.REACT_BACK_URL}/api/user/message`,
            method: 'POST',
            timeout: 60000
        },
        updateCart: { // update cart content on BE
            url: `${process.env.REACT_BACK_URL}/api/user/cart`,
            method: 'PUT',
            timeout: 20000
        },
        updateCartItemAmount: { // update cart content on BE
            url: `${process.env.REACT_BACK_URL}/api/user/cart`,
            method: 'PATCH',
            timeout: 5000
        },
    }

}

const inputsProps = { //restrictions of inputs
    email: {
        min: 6,
        max: 50
    },
    name: {
        min: 2,
        max: 40
    },
    phone: {
        min: 6,
        max: 25
    },
    message: {
        min: 20,
        max: 4000
    },
    password: {
        min: 8,
        max: 40
    },
    category: {
        min: 3,
        max: 20
    },
    color: {
        min: 2,
        max: 30
    },
    news: {
        header: {
            min: 5,
            max: 60
        },
        textShort: {
            min: 20,
            max: 200
        },
        textFull: {
            min: 40,
            max: 5000
        }
    },
    fiber: {
        nameShort: {
            min: 2,
            max: 15
        },
        nameFull: {
            min: 2,
            max: 60
        },
        textShort: {
            min: 10,
            max: 200
        },
        textFull: {
            min: 100,
            max: 5000
        },
        proscons : {
            min: 3,
            max: 250
        }
    },
    date: {
        min: new Date("2020-01-01"),
        max: new Date("2030-01-01")
    },
    product: {
        name: {
            min: 3,
            max: 40
        },
        price: {
            min: 1,
            max: 10
        },
        textShort: {
            min: 20,
            max: 150
        },
        textFull: {
            min: 50,
            max: 5000
        },
        mods : {
            min: 1,
            max: 150,
        }
    }
}

const clearModalMessage: IMessageModal = {
    status: '',
    header: '',
    text: [''],
}

const resetFetch: IFetch = {
    status: 'idle',
    message: {en: '', ru: ''},
    errors: []
}

const fetchingFetch: IFetch = {
    status: 'fetching',
    message: {en: '', ru: ''},
    errors: []
}

const errorFetch: IFetch = {
    status: 'error',
    message: {en: '', ru: ''},
    errors: []
}

const successFetch: IFetch = {
    status: 'success',
    message: {en: '', ru: ''},
    errors: []
}


const headerStatus = {
    success: {
        en: 'Success',
        ru: 'Успех'
    },
    error: {
        en: 'Error',
        ru: 'Ошибка'
    }
}


const empty: TLangText = {
    en: '',
    ru: ''
}

const selector = {
    "10": [
        {   
            value: '1',
            name: {
                en: 'none',
                ru: 'отсутствует'
            }
        },
        {   
            value: '2',
            name: {
                en: 'extremely low',
                ru: 'крайне низкая'
            }
        },
        {   
            value: '3',
            name: {
                en: 'low',
                ru: 'низкая'
            }
        },
        {   
            value: '4',
            name: {
                en: 'poor',
                ru: 'посредственная'
            }
        },
        {   
            value: '5',
            name: {
                en: 'below average',
                ru: 'ниже средней'
            }
        },
    
        {   
            value: '6',
            name: {
                en: 'average',
                ru: 'средняя'
            }
        },
    
        {   
            value: '7',
            name: {
                en: 'upper average',
                ru: 'хорошая'
            }
        },
    
        {   
            value: '8',
            name: {
                en: 'hign',
                ru: 'высокая'
            }
        },
    
        {   
            value: '9',
            name: {
                en: 'very high',
                ru: 'очень высокая'
            }
        },
    
        {   
            value: '10',
            name: {
                en: 'exellent',
                ru: 'отличная'
            }
        },
    ],
    "5": [
        {   
            value: '1',
            name: {
                en: 'low',
                ru: 'низкая'
            }
        },
        {   
            value: '2',
            name: {
                en: 'below average',
                ru: 'ниже средней'
            }
        },
        {   
            value: '3',
            name: {
                en: 'average',
                ru: 'средняя'
            }
        },
        {   
            value: '4',
            name: {
                en: 'upper average',
                ru: 'выше средней'
            }
        },
        {   
            value: '5',
            name: {
                en: 'high',
                ru: 'высокая'
            }
        },
    ],
    "3": [
        {   
            value: '1',
            name: {
                en: 'none',
                ru: 'отсутствует'
            }
        },
        {   
            value: '2',
            name: {
                en: 'average',
                ru: 'средняя'
            }
        },
        {   
            value: '3',
            name: {
                en: 'high',
                ru: 'высокая'
            }
        },
    ]
    
}

const fiberEmpty: ISendFiber = { //can be changed to be the default value for a new fiber
    _id: '',
    name: {...empty},
    text: {...empty},
    short: {
        name:{...empty},
        text:{...empty},
    },
    proscons: {
        pros: [],
        cons: []
    },
    colors: [],
    params: {} as IFiberParam,
    files: [] as File[],
}


const productEmpty: ISendProduct = {
    _id: '',
    name: {...empty},
    text: {...empty},
    //price: 0,
    text_short:{...empty},
    fibers: [],
    mods: [],
    category: '',
    files: [] as File[],
}


const emptyImages = {
    basePath: '',
    files: [],
    sizes: []
}

const newsItemEmpty: INewsItem = {
    header: {...empty},
    text: {...empty},
    short: {...empty},
    _id: '',
    images: {...emptyImages},
    date: new Date(),
}

const colorEmpty: ISendColor = {
    _id: '', 
    name: {...empty}, 
    files: {
        full: new File([], ""),
        thumb: new File([], "")
    },
    active: true
}

const orderStatuses = [
    {
        value: 'new',
        name: {
            en: 'New',
            ru: 'Новые'
        }
    },
    {
        value: 'working',
        name: {
            en: 'In progress',
            ru: 'В работе'
        }
    },
    {
        value: 'finished',
        name: {
            en: 'Finished',
            ru: 'Выполненные'
        }
    },
    {
        value: 'canceled',
        name: {
            en: 'Canceled',
            ru: 'Отмененные'
        }
    },
]


const timeOffset = (new Date()).getTimezoneOffset() / 60

const navList = {
    home: {
        en: "HOME",
        ru: "ГЛАВНАЯ",
        to: "/"
    },
    fibers: {
        en: "FIBERS",
        ru: "МАТЕРИАЛЫ",
        to: "/fibers",
        about: {
            en: "ABOUT",
            ru: "О ФИЛАМЕНТАХ",
            to: "/fibers"
        },
        compare: {
            en: "COMPARASING",
            ru: "СРАВНЕНИЕ",
            to: "/fibers/compare"
        }
    },
    catalog: {
        en: "CATALOG",
        ru: "КАТАЛОГ",
        to: "/catalog"
    },
    contacts: {
        en: "CONTACT",
        ru: "КОНТАКТЫ",
        to: "/contact_us"
    },
    cart: {
        en: "CART",
        ru: "КОРЗИНА",
        to: "/order"
    },
    account: {
        en: "ACCOUNT",
        ru: "КАБИНЕТ",
        orders: {
            en: "ALL ORDERS",
            ru: "ВСЕ ЗАКАЗЫ",
            to: "/orders"
        },
        order: {
            en: "CUSTOM ORDER",
            ru: "СВОЙ ЗАКАЗ",
            to: "/custom_order"
        },
        cart: {
            en: "CART",
            ru: "КОРЗИНА",
            to: "/order"
        },
        admin: {
            news: {
                en: "+ NEWS",
                ru: "+ НОВОСТЬ",
                to: "/admin/news-create"
            },
            color: {
                en: "+ COLOR",
                ru: "+ ЦВЕТ",
                to: "/admin/color-create"
            },
            fiber: {
                en: "+ FIBER",
                ru: "+ МАТЕРИАЛ",
                to: "/admin/fiber-create"
            },
            catalog: {
                en: "+ CATALOG",
                ru: "+ КАТАЛОГ",
                to: "/admin/catalog-change"
            },
            product: {
                en: "+ PRODUCT",
                ru: "+ ТОВАР",
                to: "/admin/product-create"
            },
            content: {
                en: "+ CONTENT",
                ru: "+ КОНТЕНТ",
                to: "/admin/splider-change"
            }
        },
        login: {
            en: "LOGIN",
            ru: "ВХОД",
        },
        logout: {
            en: "LOGOUT",
            ru: "ВЫХОД",
        }
    }
};



const exceptionTimeout = {
    message: `Request response time exceeded, aborted`,
    name: 'TimeoutError'
}

const exceptionFetch = {
    message: 'Fetch aborted by new fetch',
    name: 'ForceAbort'
}

const exceptionUser = {
    message: 'Fetch aborted by user',
    name: 'ForceAbort'
}

const DOMExceptions = {
    byTimeout: new DOMException(exceptionTimeout.message, exceptionTimeout.name),
    byFetch: new DOMException(exceptionFetch.message, exceptionFetch.name),
    byUser: new DOMException(exceptionUser.message, exceptionUser.name)
}

const nwsp = '\u00A0'


export { clearModalMessage, resetFetch, timeModalClosing, 
    fetchingFetch, errorFetch, successFetch, headerStatus, empty, selector, strengthMin, 
    strengthMax, fiberEmpty, productEmpty, colorEmpty, intervalBetweenRequests,
    orderStatuses, usersPerPage, timeOffset, inputsProps, tipsTransition, socials,
    navList, newsItemEmpty, APIList, imageExtentions, maxAmountToOrder, loadNewsPerRequest,
    exceptionTimeout, exceptionFetch, DOMExceptions, statuses, defaultSelectItem, 
    createNewItemId, gapForOrders, emptyImages, nwsp, debounceTime}