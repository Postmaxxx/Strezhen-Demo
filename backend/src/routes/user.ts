import { IUser } from "../models/User"
import { IAllCache } from '../data/cache'
import { ICartItem } from "../models/Cart"
import { TLang, TLangText } from "../interfaces"
import { IOrder, OrderType } from "../models/Orders"
import { allPaths, missedItem, sendNotificationsInTG, timeZoneDelta, orderStatus } from "../data/consts"
import { foldersCleaner } from "../processors/fsTools"
import { filesUploaderS3 } from "../processors/aws"
import { IProduct } from "../models/Product"
const moment = require('moment');
const { Router } = require("express")
const router = Router()
const User = require("../models/User")
const Order = require("../models/Orders")
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authMW = require('../middleware/auth')
const cache: IAllCache = require('../data/cache')
const fileSaver = require('../routes/files')
var fse = require('fs-extra');
const FormData = require('form-data');
const fetch = require('node-fetch');
const { ObjectId } = require('mongodb');
const isAdmin = require('../middleware/isAdmin')




const cartToFront = async (cart: ICartItem[]) => {
    if (cart.length === 0 || !cart) {
        return {filteredCart: [], fixed: []}
    }
    const errProducts = await cache.products.control.load()
    if (errProducts) {
        throw new Error('Errors while loading products', {cause: errProducts})
    }  
    const errFibers = await cache.fibers.control.load()
    if (errFibers) {
        throw new Error('Errors while loading fibers', {cause: errFibers})
    }
    const errColors = await cache.colors.control.load()
    if (errColors) {
        throw new Error('Errors while loading colors', {cause: errColors})
    }
    
    const fixed: TLangText[] = []
    const filteredCart = cart.map(cartItem => {
        let unavailable = false //if item is unavailable to order
        
        const product: IProduct = cache.products.data.find(item => item._id.toString() === cartItem.productId.toString()) //does this product exist and available for ordering
        !product?.active && (unavailable = true)

        const fiberInProduct = product?.fibers.find(fiberId => fiberId.toString() === cartItem.fiberId.toString())  //check is this fiber available for this product
        !fiberInProduct && (unavailable = true)
        
        const fiber = cache.fibers.data.find(item => cartItem.fiberId.toString() === item.id.toString())  //does this fiber exist and available for ordering
        !fiber?.active && (unavailable = true)


        const colorInFiber = fiber?.colors.find(colorId => colorId.toString() === cartItem.colorId.toString())  //check is this color available for this fiber
        !colorInFiber && (unavailable = true)
        
        const color = cache.colors.data.find(color => color._id.toString() === cartItem.colorId.toString())  //does this color exist and available for ordering
        !color?.active && (unavailable = true)
        
        if (unavailable) {
            fixed.push({
                en: `Product: ${product?.name?.en || missedItem.en}, fiber: ${fiber?.name?.en || missedItem.en}, color: ${color?.name?.en || missedItem.en}, type: ${cartItem?.type?.en || missedItem.en}, amount: ${cartItem.amount}`,
                ru: `Товар: ${product?.name?.ru || missedItem.ru}, материал: ${fiber?.name?.ru || missedItem.ru}, цвет: ${color?.name?.ru || missedItem.ru}, тип: ${cartItem?.type?.ru || missedItem.ru || missedItem.ru}, количество: ${cartItem.amount}`
            })
            return null
        }
        return {
            fiber: cartItem.fiberId.toString(),
            color: cartItem.colorId.toString(),
            amount: cartItem.amount,
            type: cartItem.type,
            product
        }
    }).filter(item => item) || [] // all products with invalid data will be ignored
    
    return {filteredCart, fixed}
}
 


interface IOrderToTg {
    lang: TLang
    user : any
    message: string
    dir: string
    files: IMulterFile[]
    res: Response
    cart: ICartItem[]
}


const orderToTg = async ({lang, user, message, files, dir, cart}: IOrderToTg) => {
    const urlMessage= `https://api.telegram.org/bot${process.env.tgToken}/sendMessage`;
    const urlDocument= `https://api.telegram.org/bot${process.env.tgToken}/sendDocument`;
    const textOrder: string = `
    ${lang === 'en' ? 'Date' : 'Дата'}: ${moment().format('YYYY-MM-DD')}
    ${lang === 'en' ? 'Time' : 'Время'}: ${moment().format('hh:mm')}
    ${lang === 'en' ? 'Name' : 'Имя'}: ${user.name}
    ${lang === 'en' ? 'Email' : 'Почта'}: ${user.email}
    ${lang === 'en' ? 'Phone' : 'Телефон'}: ${user.phone}
    ${lang === 'en' ? 'Message' : 'Сообщение'}: ${message}`;


    const textCart = cart.reduce((text: string, item, i: number) => {
        const fullProduct = cache.products.data.find(product => product._id.toString() === item.productId.toString())
        return text + `${i+1}) ${fullProduct.name[lang]}
    ${lang === 'en' ? 'Options' : 'Версия'}: ${item.type[lang]} 
    ${lang === 'en' ? 'Fiber' : 'Материал'}: ${cache.fibers.data.find(fiberItem => fiberItem._id.toString() === item.fiberId)?.short.name[lang]}
    ${lang === 'en' ? 'Color' : 'Цвет'}: ${cache.colors.data.find(color => color._id.toString() === item.colorId)?.name[lang]}
    ${lang === 'en' ? 'Amount' : 'Количество'}: ${item.amount}\n\n`
    }, '')
    
    const text = `${lang === 'en' ? 'New order' : 'Новый заказ'}:${textOrder}\n\n\n ${lang === 'en' ? 'Cart content' : 'Содержимое корзины'}: \n${textCart}${files.length > 0 ? (lang==='en' ? '\n\n\nAttached files ('+files.length+'):' : '\n\n\nПрикрепленные файлы ('+files.length+'):') : '---'}`
    
    try { //send text to TG
        const response = await fetch(urlMessage, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: process.env.chatId, text })
        })
        if (!response.ok) {
            console.log('Error while sending message using TG.', response);
        }
    } catch (e) {
        console.log(`Something wrong while sending message to TG, try again later. Error: ${e}`)
    }


    files.reduce(async (acc: Promise<string>, file, i) => {//send files to TG
        const filePathName = dir+'/'+file.filename     
        await acc
        return new Promise<string>(async (resolve, rej) => {
            const timeStart = Date.now()
            const form = new FormData();
            const fileStream = await fse.createReadStream(filePathName);
            form.append('document', fileStream, file.filename);
            form.append('chat_id', process.env.chatId || '');
            const options = {method: 'POST', body: form};
            try {   
                const response = await fetch(urlDocument, options)
                if (!response.ok) console.log(`Error while sending file: ${file.filename}`);
                const transitionSending = Date.now() - timeStart
                // if (sendingTime < minTimeBetweenSendings) => wait until (sendingTime >= minTimeBetweenSendings)
                setTimeout(() => {resolve(`File ${file.filename} has been sent successfully`)}, Number(process.env.minTimeBetweenSendings) - transitionSending)
            } catch (error) {
                console.log(`Error while sending file: ${file.filename}, error: ${error}`);
            }
        })
    }, Promise.resolve('Files sending started'))
            
}
 

interface IMessageToTg {
    message: string
    files: IMulterFile[]
    dir: string
}

const messageToTg = async ({message, files, dir}: IMessageToTg) => {
    const urlMessage= `https://api.telegram.org/bot${process.env.tgToken}/sendMessage`
    const urlDocument= `https://api.telegram.org/bot${process.env.tgToken}/sendDocument`
    try { //send text to TG
        const response = await fetch(urlMessage, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: process.env.chatId, text: message })
        })
        if (!response.ok) {
            console.log('Error while sending message using TG.', response);
            throw new Error(`Error while sending message using TG. ${response}`)
        }
    } catch (e) {
        console.log(`Something wrong while sending message to TG, try again later. Error: ${e}`)
        throw new Error(e)
    }

    files.reduce(async (acc: Promise<string>, file, i) => {//send files to TG
        const filePathName = dir+'/'+file.filename     
        await acc
        return new Promise<string>(async (resolve, rej) => {
            const timeStart = Date.now()
            const form = new FormData();
            const fileStream = await fse.createReadStream(filePathName);
            form.append('document', fileStream, file.filename);
            form.append('chat_id', process.env.chatId || '');
            const options = {method: 'POST', body: form};
            try {   
                const response = await fetch(urlDocument, options)
                if (!response.ok) console.log(`Error while sending file: ${file.filename}`);
                const transitionSending = Date.now() - timeStart
                // if (sendingTime < minTimeBetweenSendings) => wait until (sendingTime >= minTimeBetweenSendings)
                setTimeout(() => {resolve(`File ${file.filename} has been sent successfully`)}, Number(process.env.minTimeBetweenSendings) - transitionSending)
            } catch (error) {
                console.log(`Error while sending file: ${file.filename}, error: ${error}`);
            }
        })
    }, Promise.resolve('Files sending started'))
            
}
 


//api/auth/register
router.post('/register', 
    [
        check('email', {en: 'Wrong email', ru: 'Неправильная почта'}).isEmail(),
        check('password', { en: 'Password should be at least 8 symbols', ru: 'Пароль должен быть не менее 8 символов'}).isLength({ min: 8 }),
        check('name', { en: 'Name should be at least 2 symbols', ru: 'Имя должно быть не менее 2 символов'}).isLength({ min: 2 }),
        check('phone', { en: 'Phone should be at least 6 symbols', ru: 'Телефон должен быть не короче 6 цифр'}).isLength({ min: 6 }),
    ],
    async (req, res) => {
        
        const errors = validationResult(req)
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array().map(error => error.msg),
                message: {en: 'Errors in data during registration:', ru: 'Ошибки в данных при регистрации:'}
            })
        }
        try {
            const {email, password, name, phone, localDate} = req.body
            
            const candidate = await User.findOne({ email })
            if (candidate) {
                return res.status(400).json({message: {en: 'User already exists', ru: 'Такой пользователь уже существует'}, errors: [{en: 'User already exists', ru: 'Такой пользователь уже существует'}]})
            }
        
            const hashedPassword = await bcrypt.hash(password, 12);
            const user = new User({ email, password: hashedPassword, name, phone, date: localDate, cart: [] })
        
            await user.save()

            res.status(201).json({message: {en: 'User created', ru: 'Пользователь создан'}})
            
        } catch (error) {
            res.status(500).json({ message:{en: 'Something wrong with server, try again later', ru: 'Ошибка на сервере, попробуйте позже'}})
        }
    }
)



router.post('/login',
    [
        check('email', {en: 'Wrong email', ru: 'Неправильная почта'}).isEmail(),
        check('password', {en: 'Password must be at least 8 symbols', ru: 'Пароль должен быть не менее 8 символов'}).isLength({min: 8}),
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array().map(item => (item.msg)),
                message: {en: "Wrong data to login", ru: "Неправильные данные для входа"}
            })
        }

        try {
            const {email, password } = req.body
            
            const user: IUser = await User.findOne({ email })
            
            if (!user) {
                return res.status(400).json({ message: { en: 'User not found', ru: "Пользователь не найден"},  errors: [{ en: 'User not found', ru: "Пользователь не найден"}]})
            }
            
            const passwordsSame = await bcrypt.compare(password, user.password)
            
            if (!passwordsSame) {
                return res.status(400).json({ message: {en: 'Password is incorrect', ru: "Пароль неверный"}, errors: [{en: 'Password is incorrect', ru: "Пароль неверный"}]})
            }
            
            const token = jwt.sign(
                {userId: user.id},
                process.env.jwtSecret,
                { expiresIn: "1h"}
            )
                
            const cartToFE = await cartToFront(user.cart)
            const userToFront = {
                name: user.name,
                email: user.email,
                phone: user.phone,
                cart: cartToFE.filteredCart,
                fixed: cartToFE.fixed,
                token,
                isAdmin: false
            }

            if (user.email === process.env.admEmail) {
                userToFront.isAdmin = true
            }
            res.status(200).json({user: userToFront})      
        } catch (error) {
            res.status(500).json({ message:{en: `Something wrong with server (${error}), try again later`, ru: `Ошибка на сервере (${error}), попробуйте позже`}})
        }
    }
) 



router.post('/login-token',
    authMW,
    async (req, res) => {              
        try {
            const { id } = req.user
            
            const user = await User.findOne( {_id: id} )
            
            if (!user) {
                return res.status(400).json({ message: { en: 'User was not found', ru: "Пользователь не найден"}})
            }
            const newToken = jwt.sign(
                {userId: user.id},
                process.env.jwtSecret,
                { expiresIn: "1h"}
            )
           
            const cartToFE = await cartToFront(user.cart)

            const userToFront = {
                name: user.name,
                email: user.email,
                phone: user.phone,
                cart: cartToFE.filteredCart,
                fixed: cartToFE.fixed,
                token: newToken, //auto token prolong
                isAdmin: false
            }
            
            
            if (user.email === process.env.admEmail) {
                userToFront.isAdmin = true
            }
            
            res.status(200).json({user: userToFront})      
        } catch (error) {
            res.status(500).json({ message:{en: `Something wrong with server (${error}), try again later`, ru: `Ошибка на сервере (${error}), попробуйте позже`}})
        }
    }
)






router.put('/cart',
    authMW,
    async (req, res) => {       
        try {            
            const { newCart } = req.body
            const { id } = req.user
            await User.findOneAndUpdate( {_id: id}, {cart: newCart})
            
            res.status(200).json({message: {en: 'Cart has been updated', ru: 'Корзина была обновлена'}})

        } catch (error) {
            res.status(500).json({ message:{en: `Something wrong with server (${error}), try again later`, ru: `Ошибка на сервере (${error}), попробуйте позже`}})
        }
    }
)




router.patch('/cart',
    authMW,
    async (req, res) => {       
        try {            
            const updatedItem: ICartItem = req.body.updatedItem
            const { id } = req.user

            await User.findOneAndUpdate(
                {
                    _id: id,
                    "cart.productId": updatedItem.productId,
                    "cart.colorId": updatedItem.colorId,
                    "cart.type.en": updatedItem.type.en,
                    "cart.type.ru": updatedItem.type.ru,
                },
                {
                    $set: {
                        "cart.$.amount": updatedItem.amount
                    }
                }
            )
            
            res.status(200).json({message: {en: 'Cart has been updated', ru: 'Корзина была обновлена'}})

        } catch (error) {
            res.status(500).json({ message:{en: `Something wrong with server (${error}), try again later`, ru: `Ошибка на сервере (${error}), попробуйте позже`}})
        }
    }
)


interface IMulterFile {
    fieldname: string
    originalname: string
    encoding: string
    mimetype: string
    destination: string
    filename: string
    path: string
    size: number
}


router.post('/message', 
    fileSaver,
    async (req, res) => {
        const { message, lang } = req.body
        const files = req.files as IMulterFile[] || []
        
        const date = moment().utc().add(timeZoneDelta, 'hours').format("YYYY-MM-DD (dddd)");
        const time = moment().utc().add(timeZoneDelta, 'hours').format("HH:mm");

        const text = `
${lang === 'en' ? 'Date' : 'Дата'}: ${date}
${lang === 'en' ? 'Time' : 'Время'}: ${time}
${message}`

        try {
            //send data to TG
            await messageToTg({message: text, files, dir: allPaths.pathToTemp})

            await foldersCleaner([allPaths.pathToTemp])
            return res.status(200).json({message: {en: 'Message has been sent', ru: 'Сообщение было отправлено'}})
        } catch (e) {
            return res.status(500).json({ message:{en: `Something wrong with server, try again later. Error: ${e}`, ru: `Ошибка на сервере, попробуйте позже. Ошибка: ${e}`}})
        }

    }
)


router.post('/order', //checking and creating an order if everything is ok
    [authMW],
    fileSaver,
    async (req, res) => {
        const userId = req.user.id
        const { message, lang } = req.body
        const files = req.files as IMulterFile[] || []
        const fullDate = new Date().toISOString()
        let orderId = ''
       
        try {
            await cache.colors.control.load()
            await cache.fibers.control.load()
            await cache.products.control.load()
            
            const user: IUser = await User.findOne({ _id: userId})
            
            //check are there any non-exist properties in cart
            const checkResult = await cartToFront(user.cart)
            if (checkResult.fixed.length > 0) { //if cart was fixed send back fixed cart
                return res.status(409).json({ 
                    message:{
                        en: `Errors in your order, some products or features are unavailable now and was removed from your cart: `,
                        ru: `Ошибки в вашем заказе, некоторые позиции больше недоступны и были удалены из вашей корзины: `
                    },
                    cart: checkResult.filteredCart,
                    fixed: checkResult.fixed
                })
            }
            
            //send data to DB 
            const cartToSave: ICartItem[] = (user.cart as ICartItem[]).map(item => ({//convert string ids to ObjectIDs
                productId: new ObjectId(item.productId),
                colorId: new ObjectId(item.colorId),
                fiberId: new ObjectId(item.fiberId),
                amount: item.amount,
                type: item.type
            })) || [] 
             
            try {
                const order:IOrder = new Order({
                    date: fullDate,
                    status: 'new',
                    user: user._id,
                    cart: cartToSave,
                    info: {
                        message: message,
                        path: '',
                        files: files.map(file => file.filename)
                    }
                }) 
                orderId = order._id.toString()
                order.info.path = `${allPaths.pathToUserFiles}/${user._id}/${orderId}`
                await order.save() 
                const newOrders = [...user.orders, orderId]
                await User.findOneAndUpdate({ _id: userId}, {orders: newOrders})
            } catch (e) {
                return res.status(503).json({ message:{en: `Something wrong with server while saving data in DB, try again later. Error: ${e}`, ru: `Ошибка на сервере при сохранении в БД, попробуйте позже. Ошибка: ${e}`}})
            }

    
            const dir = `${allPaths.pathToUserFiles}/${userId}/${orderId}/` //create unique folder for every user using user._id
      

            const filesToUpload = []
            for (const file of files) {
                const content = await fse.readFile(file.path)
                filesToUpload.push({
                    content,
                    fileName: file.filename
                })
            }
            

            filesUploaderS3({
                bucketName: process.env.s3BucketName,
                folderName: dir,
                files: filesToUpload,
                checkFolder: true
            })
            
            //send data to TG
            if (sendNotificationsInTG) {
                await orderToTg({lang, user, message, files, dir: allPaths.pathToTemp, res, cart: user.cart})
            } 

            await User.findOneAndUpdate( {_id: user._id}, {cart: []}) //clear user's cart if order successfully created
            await foldersCleaner([allPaths.pathToTemp])
            return res.status(201).json({message: {en: 'Order created', ru: 'Заказ создан'}})
        } catch (e) {
            return res.status(500).json({ message:{en: `Something wrong with server, try again later. Error: ${e}`, ru: `Ошибка на сервере, попробуйте позже. Ошибка: ${e}`}})
        }

    }
)




router.patch('/orders', //change status for order
    [authMW, isAdmin],
    async (req, res) => {
        const {orderId, newStatus} = req.body
        
        if (newStatus !== 'new' && newStatus !== 'working' && newStatus !== 'finished' && newStatus !== 'canceled') {
            return res.status(406).json({message:{en: `Order was not found`, ru: `Заказ не найден`}})
        }

        try {         
            const order = await Order.findOneAndUpdate({ _id: orderId}, {status: newStatus})
            if (!order) {
                return res.status(404).json({message:{en: `Order was not found`, ru: `Заказ не найден`}})
            }
            return res.status(200).json({message: {en: 'Status changed', ru: 'Статус изменен'}})

        } catch (e) {
            return res.status(500).json({ message:{en: `Something wrong with server, try again later. Error: ${e}`, ru: `Ошибка на сервере, попробуйте позже. Ошибка: ${e}`}})
        }

    }
)

interface IFilterUser {
    name: string
    phone: string
    email: string
    _id: string
}


interface IOrdersCartItem {
    productName: TLangText
    fiberName: TLangText
    colorName: TLangText
    amount: number
    type: TLangText
}

 

interface IOrdersItem {
    _id: string
    date: Date
    message: string
    status: OrderType | 'all'
    cart: IOrdersCartItem[]
    pathToFiles: string
    attachedFiles: string[]
}

interface IOrdersUser {
    info: IFilterUser
    orders: IOrdersItem[]
} 



router.get('/orders', 
    [authMW],
    async (req, res) => {
        try {
            const {from, to, userId, status} = req.query
            
            const { id, isAdmin } = req.user 
            await cache.fibers.control.load()
            await cache.colors.control.load()
            await cache.products.control.load()
            
            const userList: IUser[] = !isAdmin ? 
                await User.find({_id: id}) || [] 
            : 
                userId === 'all' ? await User.find() || [] : await User.find({_id: userId}) || []
            
            const statusList: string[] = status !== 'all' ? [status] : [...orderStatus]

            const orders = await Order.find({ //search all applied orders
                user: {$in: userList},
                status: {$in: statusList},
                date: {$gte: new Date(from), $lte: new Date(to) }
                })
                .populate('user') // field name in Order referencing to User is 'user'
                .exec() //merge
                
                
            const usersToFront = orders.reduce((acc, order) => {//using {} instead of [] to increase the speed
                const userId = order.user._id.toString()
                if (!acc[userId]) {
                    const {name, email, phone, _id} = order.user
                    acc[userId] = {
                        userInfo: {name, email, phone, _id: _id.toString()},
                        orders: []
                    }
                }
                const cart = order.cart.map(cartItem => ({ //fill cart with the text using cache
                    productId: cartItem.productId,
                    productName: cache.products.data.find(el => el._id.toString() === cartItem.productId.toString())?.name || missedItem,
                    fiberName: cache.fibers.data.find(el => el._id.toString() === cartItem.fiberId.toString())?.short.name || missedItem,
                    colorName: cache.colors.data.find(el => el._id.toString() === cartItem.colorId.toString())?.name || missedItem,
                    amount: cartItem.amount,
                    type: cartItem.type
                }))

                
                
                acc[userId].orders.push({
                    _id: order._id,
                    date: order.date,
                    message: order.info.message,
                    status: order.status,
                    attachedFiles: order.info.files,
                    pathToFiles: `${process.env.pathToStorage}/${order.info.path}`,
                    cart: cart
                })
                return acc
            }, {}) 
            
            return res.status(200).json({users: Object.values(usersToFront)})

        } catch (error) {
            return res.status(500).json({ message:{en: 'Something wrong with server, try again later', ru: 'Ошибка на сервере, попробуйте позже'}})
        }
    }
)


  


router.get('/users', 
    [authMW],
    async (req, res) => {
        try {           
            const { id, isAdmin } = req.user                  
            const userListRaw: IUser[] = isAdmin ? await User.find() : await User.find({_id: id})
            const userList = userListRaw.map(item => ({
                email: item.email,
                phone: item.phone,
                name: item.name,
                _id: item._id
            }))

            return res.status(200).json({userList})
        } catch (error) {
            return res.status(500).json({ message:{en: 'Something wrong with server, try again later', ru: 'Ошибка на сервере, попробуйте позже'}})
        }
    }
)






interface ICheckItem {
    productId: string
    colorId: string
    fiberId: string
}




module.exports = router

export {IMulterFile}