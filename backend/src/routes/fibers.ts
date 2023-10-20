import { IFiber } from "../models/Fiber";
const { Router } = require("express")
const router = Router()
const isAdmin = require('../middleware/isAdmin')
const authMW = require('../middleware/auth')
const { check, validationResult } = require('express-validator')
const Fiber = require("../models/Fiber")
import { IAllCache } from '../data/cache'
import { IMulterFile } from "./user";
import { allPaths, fiberImageSizes, imageSizes } from "../data/consts";
import { resizeAndSaveS3 } from "../processors/sharp";
import { folderCleanerS3 } from "../processors/aws";
import { makeDelay } from "../processors/makeDelay";
const cache: IAllCache = require('../data/cache')
const fileSaver = require('../routes/files')
const whoIs = require('../middleware/whoIs')




router.post('/create', 
    [authMW, isAdmin],
    fileSaver, 
    async (req, res) => {       
        try {
            const { name, text, short, params, images, proscons, colors, active } = JSON.parse(req.body.data)
            const files = req.files as IMulterFile[] || []  
            const fiber: IFiber = new Fiber({ name, text, proscons, short, params, images,  colors, active })
            
            const basePath = `${allPaths.pathToImages}/${allPaths.pathToFibers}/${fiber._id}`
            const {filesList} = await resizeAndSaveS3({
                files,
                clearDir: false,
                saveFormat: 'webp',
                basePath,
                sizes: fiberImageSizes
            })
           
            fiber.images = {
                files: filesList,
                basePath: `${process.env.pathToStorage}/${basePath}`,
                sizes: fiberImageSizes.map(size => ({
                    subFolder: size,
                    w: imageSizes[size].w,
                    h: imageSizes[size].h,
                }))
            }

            await fiber.save()
            cache.fibers.obsolete = true
            return res.status(201).json({message: {en: 'Fiber has been created', ru: 'Материал создан'}})
        } catch (error) {
            return res.status(500).json({ message:{en: 'Something wrong with server, try again later', ru: 'Ошибка на сервере, попробуйте позже'}})
        }
    }
)


/*
check('name.en')
.isLength({min: 3})
.withMessage({en: 'EN name is too short (<4)', ru: 'EN имя слишком короткое (<4)'})
.isLength({max: 51})
.withMessage({en: 'EN name is too long (>50)', ru: 'EN имя слишком длинное (>50)'}),
check('name.ru')
.isLength({min: 3})
.withMessage({en: 'RU name is too short (<4)', ru: 'RU имя слишком короткое (<4)'})
.isLength({max: 51})
.withMessage({en: 'RU name is too long (>50)', ru: 'RU имя слишком длинное (>50)'}),
check('text.en')
.isLength({min: 15})
.withMessage({en: 'EN text is too short (<15)', ru: 'EN текст слишком короткий (<15)'}),
check('text.en')
.isLength({min: 15})
.withMessage({en: 'RU text is too short (<15)', ru: 'RU текст слишком короткий (<15)'}),
check('short.name.en')
.isLength({min: 1})
.withMessage({en: 'EN short-name is too short (<2)', ru: 'EN краткое имя слишком короткое (<2)'}),
check('short.name.en')
.isLength({min: 1})
.withMessage({en: 'RU short-name is too short (<2)', ru: 'RU краткое имя слишком короткое (<2)'}),
check('short.text.en')
.isLength({min: 5})
.withMessage({en: 'EN short text is too short (<5)', ru: 'EN краткий текст слишком короткий (<5)'}),
check('short.text.en')
.isLength({min: 5})
.withMessage({en: 'RU short text is too short (<5)', ru: 'RU краткий текст слишком короткий (<5)'})
],


        const errors = validationResult(req)
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array().map(error => error.msg),
                message: {en: 'Errors in fiber data', ru: 'Ошибки в данных материала'}
            })
        }
*/


router.put('/edit', 
    [authMW, isAdmin],
    fileSaver,
    async (req, res) => {
        try {
            const { name, text, short, params, proscons, colors, _id, active } = JSON.parse(req.body.data)
            const files = req.files as IMulterFile[] || []

            const basePath = `${allPaths.pathToImages}/${allPaths.pathToFibers}/${_id}`
            const {filesList} = await resizeAndSaveS3({
                files,
                clearDir: true,
                saveFormat: 'webp',
                basePath,
                sizes: fiberImageSizes
            })
           
            const images = {
                files: filesList,
                basePath: `${process.env.pathToStorage}/${basePath}`,
                sizes: fiberImageSizes.map(size => ({
                    subFolder: size,
                    w: imageSizes[size].w,
                    h: imageSizes[size].h,
                }))
            }


            await Fiber.findOneAndUpdate({_id}, {name, text, short, params, proscons, colors, images, active}) 
            cache.fibers.obsolete = true
            return res.status(201).json({message: {en: 'Fiber updated', ru: 'Материал отредактирован'}})
        } catch (error) {
            return res.status(500).json({ message:{en: 'Something wrong with server, try again later', ru: 'Ошибка на сервере, попробуйте позже'}})
        }
    }
)



router.get('/all', 
    [whoIs],
    async (req, res) => {
    try {
        const { isAdmin } = req.user
        
        const err = await cache.fibers.control.load()
        if (err) {
            return res.status(500).json(err)
        }  
        
        const filteredFibers = cache.fibers.data.filter(fiber => fiber.active) || []
        return res.status(200).json({fibers: isAdmin ? cache.fibers.data : filteredFibers})
    } catch (e) {
        return res.status(500).json({ message:{en: `Something wrong with server ${e}, try again later`, ru: `Ошибка на сервере ${e}, попробуйте позже`}})
    }
})



router.delete('/delete', 
    [authMW, isAdmin,
    check('_id')
        .exists()
        .withMessage({en: 'Fiber ID missed', ru: 'Отсутствует Fiber ID'})
    ],
    async (req, res) => {

        const errors = validationResult(req)
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array().map(error => error.msg),
                message: {en: 'Errors in received data', ru: 'Ошибки в полученных данных'}
            })
        }


        try {
            const { _id } = req.body
            const fiberToDelete = await Fiber.findOneAndDelete({_id}) 
            if (!fiberToDelete) {
                return res.status(404).json({message: {en: `Fiber was not found`, ru: `Материал не найден`}})
            }
            cache.fibers.obsolete = true
            
            const err = await cache.fibers.control.load()
            if (err) {
                return res.status(500).json(err)
            } 
            await folderCleanerS3(process.env.s3BucketName, `${allPaths.pathToImages}/${allPaths.pathToFibers}/${_id}/`)

            return res.status(200).json({message: {en: `Fiber has been deleted`, ru: `Материал был удален`}})
        } catch (error) {
            return res.status(404).json({message: {en: `Fiber was not found`, ru: `Материал не найден`}})
        }
    
})





export {};

module.exports = router
